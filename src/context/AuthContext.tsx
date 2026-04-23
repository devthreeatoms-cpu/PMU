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
              setIsAdmin(isAdminFromDB || user.uid === BOOTSTRAP_ADMIN_UID);
            } else {
              // Create default profile
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "Artist",
                role: "customer",
                points: 0,
                storeCredit: 0,
                createdAt: Date.now()
              };
              
              try {
                await setDoc(userRef, newProfile);
                // The listener will pick this up and setProfile
              } catch (createError: any) {
                console.warn("Profile creation pending...");
                setProfile(null);
                if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
              }
            }
          }, (error) => {
            console.error("Profile Listener Error:", error);
            setProfile(null);
            if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
          });

        } catch (error: any) {
          console.error("Auth Setup Error:", error);
          setProfile(null);
          if (user.uid !== BOOTSTRAP_ADMIN_UID) setIsAdmin(false);
        }
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setProfile(null);
        setIsAdmin(false);
        
        // Clear Cart Store on Logout
        const cartStore = useCartStore.getState();
        cartStore.setUserId(null);
        cartStore.setItems([]);
      }
      
      setLoading(false);
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
