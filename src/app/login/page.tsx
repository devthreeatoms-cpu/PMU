"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const BOOTSTRAP_ADMIN_UID = "JFfgcLKDtTPDsHUxrmi5L7sLIom2";

/** Determine redirect path from Firestore role, with fallback for no-rules / bootstrap */
async function getRedirectForUser(uid: string): Promise<string> {
  // Always admin for bootstrap UID
  if (uid === BOOTSTRAP_ADMIN_UID) return "/admin/dashboard";

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists() && userSnap.data().role === "admin") {
      return "/admin/dashboard";
    }
  } catch {
    // Firestore not yet accessible (locked rules) — fallback to home
  }
  return "/home";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, user, isAdmin, loading } = useAuth();
  const router = useRouter();

  // After Google login, once AuthContext resolves the role, redirect accordingly
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.replace("/admin/dashboard");
      }
      // For regular users, the login handler already pushed to /home
    }
  }, [user, isAdmin, loading]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
      const redirectPath = await getRedirectForUser(loggedInUser.uid);
      toast.success(redirectPath === "/admin/dashboard" ? "Admin Console unlocked." : "Logged in successfully.");
      router.push(redirectPath);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // Redirect is handled in the useEffect above once isAdmin resolves
      // Fallback for regular users
      toast.success("Logged in with Google");
      router.push("/home");
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-md shadow-xl border-zinc-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
            <CardDescription>
              Login to your PMU SUPPLY account to track orders and rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="h-12 border-zinc-300 hover:bg-zinc-100 transition-all font-semibold"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500 font-medium">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="h-12 border-zinc-300 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-brand-gold hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="h-12 border-zinc-300 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-black text-white hover:bg-zinc-800 transition-all font-bold"
                disabled={isLoading}
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-zinc-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-gold hover:underline font-bold">
                Create Account
              </Link>
            </div>
            <div className="text-center">
              <Link href="/admin/login" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                Admin Console →
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
