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
  ArrowUpRight,
  UserPlus,
  ShieldAlert,
  Download,
  Loader2
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getAllUsersAction, setUserRoleAction, registerUserAction } from "./actions";
import { UserProfile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({ email: "", displayName: "", role: "customer" });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
      } else {
        toast.error(res.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    const newRole = selectedUser.role === 'admin' ? 'customer' : 'admin';
    
    setIsLoading(true);
    try {
      const res = await setUserRoleAction(selectedUser.uid, newRole);
      if (res.success) {
        toast.success(`User updated to ${newRole}.`);
        await fetchUsers();
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await registerUserAction(regForm);
      if (res.success) {
        toast.success("User registered successfully.");
        setIsRegisterOpen(false);
        setRegForm({ email: "", displayName: "", role: "customer" });
        await fetchUsers();
      } else {
        toast.error(res.error || "Registration failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Store Credit", "UID", "Joined"];
    const rows = filteredUsers.map(user => [
      user.displayName || "N/A",
      user.email || "N/A",
      user.role || "customer",
      (user.storeCredit || 0).toString(),
      user.uid,
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `user_directory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("User directory exported.");
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
          <h1 className="text-3xl font-heading font-normal">User Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage global user network and account security.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2 px-6"
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
          >
            <Download className="w-3 h-3" /> Export CSV
          </Button>
          
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger 
              render={
                <Button size="sm" className="bg-brand-gold hover:bg-brand-gold/90 text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 flex gap-2">
                  <UserPlus className="w-3 h-3" /> Register User
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading">New User Account</DialogTitle>
                <DialogDescription className="text-xs font-bold tracking-widest uppercase text-zinc-400">Initialize a new user profile in the system.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-500">Professional Name</Label>
                  <Input 
                    required
                    className="h-12 rounded-2xl bg-zinc-50 border-zinc-100" 
                    placeholder="e.g. Jane Doe"
                    value={regForm.displayName}
                    onChange={(e) => setRegForm({...regForm, displayName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-500">Email Address</Label>
                  <Input 
                    required
                    type="email"
                    className="h-12 rounded-2xl bg-zinc-50 border-zinc-100" 
                    placeholder="user@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-500">Initial Designation</Label>
                  <select 
                    className="w-full h-12 rounded-2xl bg-zinc-50 border border-zinc-100 px-4 text-sm font-medium"
                    value={regForm.role}
                    onChange={(e) => setRegForm({...regForm, role: e.target.value})}
                  >
                    <option value="customer">User (Customer)</option>
                    <option value="admin">Admin (System Administrator)</option>
                  </select>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-black hover:bg-brand-gold text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-zinc-900/10">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize Registration"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Users" value={isLoading ? "..." : users.length.toString()} icon={<UsersIcon className="w-4 h-4" />} />
        <MetricCard title="Customers" value={isLoading ? "..." : users.filter(u => u.role !== "admin").length.toString()} icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} />
        <MetricCard title="Admin Accounts" value={isLoading ? "..." : users.filter(u => u.role === "admin").length.toString()} icon={<ArrowUpRight className="w-4 h-4 text-emerald-500" />} />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by name, email or UID..." 
            className="pl-10 h-11 border-zinc-100 rounded-full focus:ring-brand-gold/20 focus:border-brand-gold bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 rounded-full px-6 text-[10px] font-bold tracking-widest uppercase border-zinc-100 gap-3">
          <Filter className="w-3 h-3" /> Advanced Filter
        </Button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-bold uppercase tracking-widest">User Profile</TableHead>
               <TableHead className="text-[10px] font-bold uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Store Credit</TableHead>
              <TableHead className="text-right px-8 text-[10px] font-bold uppercase tracking-widest">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-24 text-center">
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
                        {initials(user.displayName || "Unknown")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">{user.displayName || "No Name"}</span>
                        <span className="text-[10px] text-zinc-400 font-light italic truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 py-1 font-bold text-[8px] uppercase tracking-tighter border ${user.role === "admin" ? "bg-brand-rose/10 text-brand-gold border-brand-rose/30" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-black text-zinc-900">
                    ₹{(user.storeCredit || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Dialog onOpenChange={(open) => {
                      if(open) {
                        setSelectedUser(user);
                      }
                    }}>
                    <DialogTrigger 
                      render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    />
                      {selectedUser?.uid === user.uid && (
                        <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-10 border-none shadow-2xl">
                          <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 rounded-[2rem] bg-brand-rose/20 flex items-center justify-center text-xl font-heading text-brand-black border border-brand-rose/30">
                                {initials(selectedUser.displayName || "Unknown")}
                              </div>
                              <div className="text-left">
                                <DialogTitle className="text-2xl font-heading">{selectedUser.displayName}</DialogTitle>
                                <DialogDescription className="text-xs font-bold tracking-widest uppercase text-zinc-400">{selectedUser.email}</DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>
                          
                          <div className="space-y-8 animate-in slide-in-from-left-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100 text-left">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-2"><Award className="w-3 h-3" /> Current Role</p>
                                <p className="text-sm font-bold text-zinc-900 capitalize">{selectedUser.role}</p>
                              </div>
                              <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100 text-left">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-2"><History className="w-3 h-3" /> Joined</p>
                                <p className="text-sm font-bold text-zinc-900">
                                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2 ml-1">
                                <ShieldAlert className="w-3 h-3 text-brand-gold" /> System Permissions
                              </Label>
                              <Button 
                                className={`w-full h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
                                  selectedUser.role === 'admin' 
                                    ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" 
                                    : "bg-brand-black text-white hover:bg-brand-gold"
                                }`} 
                                onClick={handleToggleRole}
                                disabled={isLoading}
                              >
                                {isLoading ? "Updating..." : selectedUser.role === 'admin' ? "Demote to Customer" : "Promote to Administrator"}
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border-zinc-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all gap-2">
                                <Ban className="w-3 h-3" /> Suspend Account
                              </Button>
                              <Button variant="outline" className="flex-1 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border-zinc-100 gap-2">
                                <Mail className="w-3 h-3" /> Professional Outbox
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
