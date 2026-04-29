import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  increment,
  writeBatch,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { Product, Order, Coupon, UserProfile, Referral, ShopAllSettings, ReferralSettings, PointTransaction, SocialLinks } from "@/lib/types";

export interface ResultItem {
  id?: string;
  url: string;
  title: string;
  order: number;
  isActive: boolean;
  createdAt: number;
}

// --- REFERRAL SYSTEM SETTINGS ---

export const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  referrerRewardPoints: 500,
  refereeDiscountPercentage: 10,
  referralRequirement: 'first_purchase',
  maxEarningsPerUser: 10000,
  isActive: true
};

export const getReferralSettings = async (): Promise<ReferralSettings> => {
  try {
    const settingsRef = doc(db, "siteSettings", "referral");
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) return settingsDoc.data() as ReferralSettings;
  } catch (error) {
    console.warn("Using default referral settings.");
  }
  return DEFAULT_REFERRAL_SETTINGS;
};

export const updateReferralSettings = async (settings: ReferralSettings) => {
  const settingsRef = doc(db, "siteSettings", "referral");
  await setDoc(settingsRef, settings, { merge: true });
};

// --- SHOP ALL DESIGN SETTINGS ---

export const DEFAULT_SHOP_ALL_SETTINGS: ShopAllSettings = {
  grid: {
    desktop: 4,
    tablet: 3,
    mobile: 2,
    gap: 24
  },
  card: {
    aspectRatio: 'square',
    imageFit: 'cover',
    textAlignment: 'left',
    showBadge: true,
    titleSize: 'xs',
    priceSize: 'sm',
    padding: 0,
    borderRadius: 8
  }
};

export const getShopAllSettings = async (): Promise<ShopAllSettings> => {
  try {
    const settingsRef = doc(db, "siteSettings", "shopAll");
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as ShopAllSettings;
    }
  } catch (error) {
    console.warn("🔐 Guest Mode: Using default design settings (Read-only access).");
  }
  
  return DEFAULT_SHOP_ALL_SETTINGS;
};

export const updateShopAllSettings = async (settings: ShopAllSettings) => {
  const settingsRef = doc(db, "siteSettings", "shopAll");
  await setDoc(settingsRef, settings, { merge: true });
};

// --- SOCIAL LINKS SERVICE ---

export const getSocialLinks = async (): Promise<SocialLinks> => {
  try {
    const settingsRef = doc(db, "siteSettings", "social");
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) return settingsDoc.data() as SocialLinks;
  } catch (error) {
    console.warn("Using default social links.");
  }
  return {};
};

export const updateSocialLinks = async (links: SocialLinks) => {
  const settingsRef = doc(db, "siteSettings", "social");
  await setDoc(settingsRef, links, { merge: true });
};

// --- USER & POINTS SERVICE ---

// --- INVENTORY SERVICE ---

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  const productRef = doc(db, "products", productId);
  const settingsDoc = await getDoc(productRef);
  
  if (settingsDoc.exists()) {
    return { id: settingsDoc.id, ...settingsDoc.data() } as Product;
  }
  return null;
};

export const updateProductStock = async (productId: string, newStock: number) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, { stock: newStock, updatedAt: Date.now() });
};

// --- ORDER SERVICE ---

export const getOrders = async (status?: string): Promise<Order[]> => {
  const ordersRef = collection(db, "orders");
  const q = status 
    ? query(ordersRef, where("status", "==", status), orderBy("createdAt", "desc"))
    : query(ordersRef, orderBy("createdAt", "desc"));
    
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status, updatedAt: Date.now() });
};

// --- MARKETING SERVICE ---

export const getCoupons = async (): Promise<Coupon[]> => {
  const querySnapshot = await getDocs(collection(db, "coupons"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
};

export const createCoupon = async (couponData: Partial<Coupon>) => {
  return await addDoc(collection(db, "coupons"), {
    ...couponData,
    usageCount: 0,
    isActive: true
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

export const adjustUserPoints = async (userId: string, pointsDelta: number, reason: string, adminId?: string) => {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);
  const transactionRef = doc(collection(userRef, "transactions"));

  batch.update(userRef, { 
    points: increment(pointsDelta)
  });

  const transaction: PointTransaction = {
    id: transactionRef.id,
    userId,
    amount: pointsDelta,
    type: pointsDelta > 0 ? 'earn' : 'redeem',
    reason,
    adminId,
    createdAt: Date.now()
  };

  batch.set(transactionRef, transaction);
  await batch.commit();
};

export const getUserTransactions = async (userId: string): Promise<PointTransaction[]> => {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const q = query(transactionsRef, orderBy("createdAt", "desc"), limit(50));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as PointTransaction));
};

// --- RESULTS GALLERY SERVICE ---

export const getResults = async (onlyActive = false): Promise<ResultItem[]> => {
  const resultsRef = collection(db, "healedResults");
  const q = onlyActive 
    ? query(resultsRef, where("isActive", "==", true), orderBy("order", "asc"))
    : query(resultsRef, orderBy("order", "asc"));
    
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResultItem));
};

export const createResult = async (data: Omit<ResultItem, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, "healedResults"), {
    ...data,
    createdAt: Date.now(),
    isActive: true
  });
};

export const updateResult = async (id: string, data: Partial<ResultItem>) => {
  const resultRef = doc(db, "healedResults", id);
  await updateDoc(resultRef, { ...data, updatedAt: Date.now() });
};

export const deleteResult = async (id: string) => {
  const resultRef = doc(db, "healedResults", id);
  await deleteDoc(resultRef);
};

export const reorderResults = async (resultIds: string[]) => {
  const batch = writeBatch(db);
  resultIds.forEach((id, index) => {
    const ref = doc(db, "healedResults", id);
    batch.update(ref, { order: index + 1 });
  });
  await batch.commit();
};

// --- REFERRAL AUDIT SERVICE ---

export const getReferralAuditData = async () => {
  const users = await getAllUsers();
  const referrers = users.filter(u => (u.totalReferralEarnings || 0) > 0 || users.some(r => r.referredBy === u.uid));
  
  return referrers.map(referrer => {
    const directReferrals = users.filter(u => u.referredBy === referrer.uid);
    return {
      uid: referrer.uid,
      displayName: referrer.displayName,
      referralCode: referrer.referralCode,
      referralCount: directReferrals.length,
      conversionCount: directReferrals.filter(u => u.hasOrderedBefore).length,
      earnings: referrer.totalReferralEarnings || 0,
      status: (referrer as any).status || 'active',
      referrals: directReferrals.map(r => ({
        uid: r.uid,
        displayName: r.displayName,
        createdAt: r.createdAt
      }))
    };
  });
};

// --- DASHBOARD SERVICE ---

export const getDashboardStats = async () => {
  const orders = await getOrders();
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  
  // Actually usually you'd use a server-side aggregation for performance, 
  // but for MVP this works.
  
  return {
    totalRevenue,
    totalOrders,
    recentOrders: orders.slice(0, 5)
  };
};

// --- SEED UTILITY ---

export const seedDatabase = async () => {
  console.log("Starting Database Seed...");
  
  const PRODUCTS = [
    // --- NEEDLES ---
    { 
      name: "V3 Nano Precision Cartridge (20pcs)", 
      price: 55.00, 
      category: "Needles", 
      imageUrls: ["https://images.unsplash.com/photo-1611558709798-e009c8fd7706?auto=format&fit=crop&q=80&w=800"],
      description: "Ultra-sharp nano needles for extreme precision in hairstrokes and shading."
    },
    { 
      name: "Master Shader 1RL 0.25mm", 
      price: 48.00, 
      category: "Needles", 
      imageUrls: ["https://images.unsplash.com/photo-1598300046647-5296761abbc8?auto=format&fit=crop&q=80&w=800"],
      description: "Perfect for delicate lip shading and fine eyeliner work."
    },
    
    // --- PIGMENTS ---
    { 
      name: "Midnight Black Eyeliner Pigment", 
      price: 35.00, 
      category: "Pigments", 
      imageUrls: ["https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800"],
      description: "Rich, carbon-black pigment that stays true without turning blue."
    },
    { 
      name: "Dusty Rose Lip Blush Liquid", 
      price: 32.00, 
      category: "Pigments", 
      imageUrls: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"],
      description: "A soft, romantic rose shade perfect for natural lip enhancement."
    },
    { 
      name: "Organic Cocoa Brow Pigment", 
      price: 32.00, 
      category: "Pigments", 
      imageUrls: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800"],
      description: "Warm brown organic pigment for dark brunette brows."
    },

    // --- MACHINES ---
    { 
      name: "Ambition Pro Wireless Pen (Rose Gold)", 
      price: 299.00, 
      salePrice: 249.00,
      category: "Machines & Power Supplies", 
      imageUrls: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800"], // Better Machine Image
      description: "Freedom of movement with 8+ hours of battery life and ergonomic grip."
    },
    { 
      name: "Elite Digital Power Unit", 
      price: 185.00, 
      category: "Machines & Power Supplies", 
      imageUrls: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"],
      description: "Precise voltage control with digital touch-screen interface."
    },

    // --- AFTERCARE ---
    { 
      name: "Booms Butter Aftercare Balm", 
      price: 15.00, 
      category: "Aftercare", 
      imageUrls: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800"], // Better Jar Image
      description: "Soothing botanical butter for intensive healing after PMU procedures."
    },
    { 
      name: "Gentle Cleansing Foam (Before & After)", 
      price: 19.00, 
      category: "Aftercare", 
      imageUrls: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800"],
      description: "Sulfate-free cleanser designed to protect pigment retention."
    },

    // --- PRACTICE ---
    { 
      name: "Signature Practice Latex with Eyes", 
      price: 9.50, 
      category: "Practice Materials", 
      imageUrls: ["https://images.unsplash.com/photo-1583241801142-113b9f5bbde5?auto=format&fit=crop&q=80&w=800"], // Better Square Practice Image
      description: "Realistic skin-like texture for practicing hairstroke patterns."
    },
    { 
      name: "Breast Reconstruction Practice 3D Skin", 
      price: 14.00, 
      category: "Practice Materials", 
      imageUrls: ["https://images.unsplash.com/photo-1616391182219-e080b4d1043a?auto=format&fit=crop&q=80&w=800"],
      description: "3D contoured latex for medical tattooing and areola practice."
    },
    { 
      name: "White Mapping Pencil Duo", 
      price: 8.00, 
      category: "Practice Materials", 
      imageUrls: ["https://images.unsplash.com/photo-1596704017254-9b12106ec127?auto=format&fit=crop&q=80&w=800"],
      description: "Smudge-proof white pencils for precise brow mapping."
    },

    // --- NUMBING ---
    { 
      name: "TKTX Gold Numbing Cream (10g)", 
      price: 25.00, 
      category: "Anesthetic/Numbing", 
      imageUrls: ["https://images.unsplash.com/photo-1556228515-91988a245d44?auto=format&fit=crop&q=80&w=800"],
      description: "Fast-acting 40% deep numbing for long procedures."
    },
    { 
      name: "Blue Gel Secondary Anesthetic", 
      price: 28.00, 
      category: "Anesthetic/Numbing", 
      imageUrls: ["https://images.unsplash.com/photo-1616670876426-387010775681?auto=format&fit=crop&q=80&w=800"],
      description: "Secondary numbing gel to reduce swelling and bleeding during procedures."
    },
    { 
      name: "Tag #45 Numbing Gel", 
      price: 32.00, 
      category: "Anesthetic/Numbing", 
      imageUrls: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"],
      description: "High-potency secondary anesthetic for immediate comfort."
    },
  ];

  const batch = writeBatch(db);
  
  for (const p of PRODUCTS) {
    const pRef = doc(collection(db, "products"));
    batch.set(pRef, {
      ...p,
      slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: p.description || "Professional grade PMU equipment for elite artists.",
      stock: Math.floor(Math.random() * 50) + 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true
    });
  }

  await batch.commit();
  console.log("Database Seeded Successfully!");
};
