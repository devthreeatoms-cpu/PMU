"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile, CartItem } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { onUserRegisteredAction } from "@/app/register/actions";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      const BOOTSTRAP_ADMIN_UID = "JFfgcLKDtTPDsHUxrmi5L7sLIom2";

      if (user) {
        try {
          const { doc, onSnapshot, setDoc } = await import("firebase/firestore");
          const userRef = doc(db, "users", user.uid);
          
          if (user.uid === BOOTSTRAP_ADMIN_UID) {
            setIsAdmin(true);
          }

          // Start real-time listener for profile
          unsubscribeProfile = onSnapshot(userRef, async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              setProfile(data);
              
              // Sync Cart Store
              const cartStore = useCartStore.getState();
              cartStore.setUserId(user.uid);
              if (data.cart) {
                cartStore.setItems(data.cart);
              }
              
              const isAdminFromDB = data.role === "admin";
              const isStaffFromDB = data.role === "staff";
              setIsAdmin(isAdminFromDB || isStaffFromDB || user.uid === BOOTSTRAP_ADMIN_UID);
            } else {
              // Create default profile
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "Artist",
                role: "customer",
                createdAt: Date.now()
              };
              
              try {
                await setDoc(userRef, newProfile);
                
                // Trigger Welcome Email for new users
                try {
                  await onUserRegisteredAction(newProfile.email, newProfile.displayName);
                } catch (e) {
                  console.error("Welcome email failed", e);
                }
                
                // The listener will pick this up and setProfile
              } catch (createError: any) {
                console.warn("Profile creation pending...");
                setProfile(null);
                if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
              }
            }
            setLoading(false);
          }, (error) => {
            console.error("Profile Listener Error:", error);
            setProfile(null);
            if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
            setLoading(false);
          });

        } catch (error: any) {
          console.error("Auth Setup Error:", error);
          setProfile(null);
          if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
          setLoading(false);
        }
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setProfile(null);
        setIsAdmin(false);
        
        // Clear Cart Store on Logout
        const cartStore = useCartStore.getState();
        cartStore.setUserId(null);
        cartStore.setItems([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Profile creation is handled automatically in the onAuthStateChanged effect above
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe fallback for SSR or components outside the provider
    // This prevents the "must be used within an AuthProvider" crash
    return {
      user: null,
      profile: null,
      isAdmin: false,
      loading: true,
      loginWithGoogle: async () => {},
      logout: async () => {},
    };
  }
  return context;
};
