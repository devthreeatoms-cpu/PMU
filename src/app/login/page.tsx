"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { user, isAdmin, loading, loginWithGoogle } = useAuth();
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
      
      if (redirectPath === "/admin/dashboard") {
        await auth.signOut();
        toast.error("Administrators must login via the Secure Gateway.");
        return;
      }
      
      const finalRedirect = (redirectPath === "/home" && returnUrl) ? returnUrl : redirectPath;
      
      toast.success("Logged in successfully.");
      router.push(finalRedirect);
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
      toast.success("Successfully authenticated with Google.");
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsResetLoading(false);
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
                  
                  <Dialog>
                    <DialogTrigger 
                      render={
                        <button type="button" className="text-xs text-brand-gold hover:underline font-medium">
                          Forgot password?
                        </button>
                      }
                    />
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email Address</Label>
                          <Input 
                            id="reset-email" 
                            type="email" 
                            placeholder="name@example.com" 
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required 
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-bold"
                          disabled={isResetLoading}
                        >
                          {isResetLoading ? "SENDING LINK..." : "SEND RESET LINK"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                className="w-full h-12 bg-brand-gold text-white hover:bg-brand-gold/90 transition-all font-bold"
                disabled={isLoading}
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full h-12 border-zinc-200 hover:bg-zinc-50 transition-all font-semibold gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-zinc-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-gold hover:underline font-bold">
                Create Account
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
