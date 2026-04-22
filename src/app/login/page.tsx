"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Suspense } from "react";
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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  // After login, once AuthContext resolves the role, redirect accordingly
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.replace("/admin/dashboard");
      } else if (returnUrl) {
        router.replace(returnUrl);
      } else {
        router.replace("/home");
      }
    }
  }, [user, isAdmin, loading, returnUrl, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
      const redirectPath = await getRedirectForUser(loggedInUser.uid);
      
      const finalRedirect = (redirectPath === "/home" && returnUrl) ? returnUrl : redirectPath;
      
      toast.success(redirectPath === "/admin/dashboard" ? "Admin Console unlocked." : "Logged in successfully.");
      router.push(finalRedirect);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
