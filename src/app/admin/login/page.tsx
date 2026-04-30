"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const BOOTSTRAP_ADMIN_UID = "JFfgcLKDtTPDsHUxrmi5L7sLIom2";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);

      // Bootstrap bypass for owner
      if (loggedInUser.uid === BOOTSTRAP_ADMIN_UID) {
        toast.success("Root Admin Access Granted.");
        router.push("/admin/dashboard");
        return;
      }

      // For all others, verify admin role in Firestore
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const userSnap = await getDoc(doc(db, "users", loggedInUser.uid));
        const role = userSnap.data()?.role;

        if (role !== "admin" && role !== "staff") {
          toast.error("Unauthorized: Administrative access only.");
          await auth.signOut();
          return;
        }
        toast.success("Identity Verified. Accessing Console...");
        router.push("/admin/dashboard");
      } catch {
        // If Firestore fails (locked rules), block access to be safe
        toast.error("Cannot verify admin role. Please update Firestore Security Rules first.");
        await auth.signOut();
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const { user: loggedInUser } = await signInWithPopup(auth, provider);

      // Bootstrap bypass for owner
      if (loggedInUser.uid === BOOTSTRAP_ADMIN_UID) {
        toast.success("Root Admin Access Granted.");
        router.push("/admin/dashboard");
        return;
      }

      // Verify admin role in Firestore
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const userSnap = await getDoc(doc(db, "users", loggedInUser.uid));
      const role = userSnap.data()?.role;

      if (role !== "admin" && role !== "staff") {
        toast.error("Unauthorized: Administrative access only.");
        await auth.signOut();
        return;
      }

      toast.success("Identity Verified. Accessing Console...");
      router.push("/admin/dashboard");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-rose/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        <div className="text-center mb-4 w-full flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-brand-rose/30 shadow-xl z-20 group transition-all duration-500 hover:border-brand-gold/50">
            <ShieldCheck className="w-8 h-8 text-brand-gold group-hover:scale-110 transition-transform" />
          </div>

          <div className="flex flex-col items-center w-full -mt-10">
            <div className="relative h-32 w-full max-w-[320px] md:h-56 md:max-w-[600px] transform transition-transform duration-700 hover:scale-[1.02]">
              <Image 
                src="/images/logo1.png" 
                alt="PMU SUPPLY" 
                fill
                className="object-contain brightness-[1.05] contrast-[1.15]"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
                quality={100}
                priority
              />
            </div>
          </div>

          <p className="text-zinc-400 text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold -mt-12 md:-mt-16">Secured Administrative Gateway</p>
        </div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-brand-rose/20 p-8 rounded-[2rem] shadow-2xl -mt-4">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase ml-1">Admin Identifier</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="admin@pmusupply.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-zinc-100 text-zinc-900 h-12 rounded-xl focus:ring-brand-gold/20 focus:border-brand-gold transition-all pl-10"
                />
                <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase ml-1">Security Keyphrase</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-zinc-100 text-zinc-900 h-12 rounded-xl focus:ring-brand-gold/20 focus:border-brand-gold transition-all pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#FF4D6D] hover:opacity-90 text-white font-bold h-12 rounded-xl tracking-widest uppercase text-xs transition-all duration-300 shadow-lg shadow-brand-gold/10"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   AUTHENTICATING...
                </div>
              ) : (
                "INITIALIZE ACCESS"
              )}
            </Button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#FF4D6D]/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-white px-2 text-[#FF4D6D]">OR</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-[#FF4D6D]/5 text-[#FF4D6D] font-bold h-12 rounded-xl tracking-widest uppercase text-xs transition-all duration-300 border-[#FF4D6D]"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-50 flex justify-between items-center">
            <Link href="/" className="text-[9px] font-bold text-[#FF4D6D] hover:opacity-70 tracking-widest uppercase transition-all">
               Return to Terminal
            </Link>
            <span className="text-[9px] font-mono text-[#FF4D6D] opacity-60">v2.4.0_SECURE</span>
          </div>
        </div>

        <p className="mt-8 text-center text-zinc-400 text-[10px] tracking-wide font-light italic opacity-60">
          Unauthorized access attempts are logged and reported. <br/>
          By accessing this system, you agree to the administrative security protocols.
        </p>
      </div>
    </div>
  );
}
