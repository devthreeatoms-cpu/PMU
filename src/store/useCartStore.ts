import { create } from 'zustand';
import { Product, CartItem } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (product: Product, quantity: number, variantId?: string, variantName?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const syncCartToFirestore = async (userId: string | null, items: CartItem[]) => {
  if (!userId) return;
  try {
    const userRef = doc(db, "users", userId);
    // Firestore does not accept undefined values. We stringify/parse to strip them.
    const sanitizedItems = JSON.parse(JSON.stringify(items));
    await updateDoc(userRef, { cart: sanitizedItems });
  } catch (err) {
    console.error("Failed to sync cart:", err);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  userId: null,

  setUserId: (userId) => set({ userId }),
  
  setItems: (items) => set({ items }),

  addItem: (product, quantity = 1, variantId, variantName) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && item.variantId === variantId
      );
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          (item.product.id === product.id && item.variantId === variantId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity, variantId, variantName }];
      }

      syncCartToFirestore(state.userId, newItems);
      return { items: newItems, isOpen: true };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => !(item.product.id === productId && item.variantId === variantId)
      );
      syncCartToFirestore(state.userId, newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity, variantId) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        (item.product.id === productId && item.variantId === variantId) 
          ? { ...item, quantity } 
          : item
      );
      syncCartToFirestore(state.userId, newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    const { userId } = get();
    set({ items: [] });
    syncCartToFirestore(userId, []);
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  getCartTotal: () => {
    return get().items.reduce((total, item) => {
      const variant = item.product.variants?.find(v => v.id === item.variantId);
      const price = (item.product.salePrice ?? item.product.price) + (variant?.priceModifier || 0);
      return total + price * item.quantity;
    }, 0);
  },

  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
