"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Users as UsersIcon,
  ShieldCheck,
  Ban,
  MoreVertical,
  Mail,
  Award,
  History,
  Coins,
  ArrowUpRight,
  UserPlus
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getAllUsers, adjustUserPoints } from "@/lib/services/admin";
import { UserProfile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pointAdjustment, setPointAdjustment] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAdjustPoints = async () => {
    if (!selectedUser || !pointAdjustment) return;
    const delta = parseInt(pointAdjustment, 10);
    if (isNaN(delta)) return toast.error("Enter a valid number");
    try {
      await adjustUserPoints(selectedUser.uid, delta);
      toast.success(`${delta > 0 ? "+" : ""}${delta} points applied to ${selectedUser.displayName}`);
      const data = await getAllUsers();
      setUsers(data);
      setSelectedUser(null);
      setPointAdjustment("");
    } catch (error) {
      toast.error("Failed to update points");
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initials = (name: string) => name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Customer Intelligence</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage global artist network, loyalty tiers, and account security.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2 px-6">
            Export CSV
          </Button>
          <Button size="sm" className="bg-zinc-950 hover:bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 flex gap-2">
            <UserPlus className="w-3 h-3" /> Register Artist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Artists" value={isLoading ? "..." : users.length.toString()} icon={<UsersIcon className="w-4 h-4" />} />
        <MetricCard title="Verified Artists" value={isLoading ? "..." : users.filter(u => u.role !== "admin").length.toString()} icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} />
        <MetricCard title="Total Loyalty Pts" value={isLoading ? "..." : users.reduce((a, u) => a + (u.points || 0), 0).toLocaleString()} icon={<Coins className="w-4 h-4 text-brand-gold" />} />
        <MetricCard title="Admin Accounts" value={isLoading ? "..." : users.filter(u => u.role === "admin").length.toString()} icon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />} />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by name, email or UID..." 
            className="pl-10 h-11 border-zinc-100 rounded-2xl focus:ring-brand-gold/20 focus:border-brand-gold bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 rounded-2xl px-6 text-[10px] font-bold tracking-widest uppercase border-zinc-100 gap-3">
          <Filter className="w-3 h-3" /> Advanced Filter
        </Button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-bold uppercase tracking-widest">Artist Profile</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Loyalty Balance</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Store Credit</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Referral Code</TableHead>
              <TableHead className="text-right px-8 text-[10px] font-bold uppercase tracking-widest">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <p className="text-zinc-400 text-sm italic">
                    {users.length === 0 ? "No users registered yet." : "No matching users found."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.uid} className="hover:bg-zinc-50/50 transition-colors group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center font-heading text-zinc-400 border border-zinc-100 group-hover:border-brand-gold group-hover:bg-brand-rose/10 group-hover:text-brand-black transition-all text-xs font-bold">
                        {initials(user.displayName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">{user.displayName}</span>
                        <span className="text-[10px] text-zinc-400 font-light italic truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 py-1 font-bold text-[8px] uppercase tracking-tighter border ${user.role === "admin" ? "bg-brand-rose/10 text-brand-gold border-brand-rose/30" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Coins className="w-3 h-3 text-brand-gold" />
                      <span className="text-xs font-bold text-zinc-900">{(user.points || 0).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-black text-zinc-900">
                    ₹{(user.storeCredit || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-zinc-500 font-bold tracking-widest">
                    {user.referralCode || "—"}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Dialog>
                      <DialogTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400" onClick={() => setSelectedUser(user)}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                      />
                      {selectedUser?.uid === user.uid && (
                        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 border-none shadow-2xl">
                          <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 rounded-[2rem] bg-brand-rose/20 flex items-center justify-center text-xl font-heading text-brand-black border border-brand-rose/30">
                                {initials(selectedUser.displayName)}
                              </div>
                              <div>
                                <DialogTitle className="text-2xl font-heading">{selectedUser.displayName}</DialogTitle>
                                <DialogDescription className="text-xs font-bold tracking-widest uppercase text-zinc-400">{selectedUser.email}</DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          
                          <div className="space-y-8 py-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-2"><Award className="w-3 h-3" /> Role</p>
                                <p className="text-sm font-bold text-zinc-900 capitalize">{selectedUser.role}</p>
                              </div>
                              <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-2"><History className="w-3 h-3" /> Joined</p>
                                <p className="text-sm font-bold text-zinc-900">
                                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2 ml-1">
                                <Coins className="w-3 h-3 text-brand-gold" /> Manual Points Adjustment
                              </Label>
                              <div className="flex gap-2">
                                <Input 
                                  type="number" 
                                  placeholder="+/- points (e.g. 100 or -50)" 
                                  className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                                  value={pointAdjustment}
                                  onChange={(e) => setPointAdjustment(e.target.value)}
                                />
                                <Button className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest" onClick={handleAdjustPoints}>
                                  Update
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border-zinc-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all gap-2">
                                <Ban className="w-3 h-3" /> Restrict Account
                              </Button>
                              <Button variant="outline" className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border-zinc-100 gap-2">
                                <Mail className="w-3 h-3" /> Direct Message
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white hover:border-brand-gold transition-colors group cursor-default p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-zinc-900 group-hover:text-brand-gold transition-colors">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-brand-rose/20 group-hover:text-brand-black transition-all">
          {icon}
        </div>
      </div>
    </Card>
  );
}
