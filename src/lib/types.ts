export type ProductCategory = 
  | "Machines & Power Supplies"
  | "Needles"
  | "Pigments"
  | "Practice Materials"
  | "Aftercare"
  | "Anesthetic/Numbing"
  | "Shaping Tools"
  | "Lashes"
  | "Other";

export interface ProductVariant {
  id: string;
  name: string;      // e.g. "Pink", "0.30mm"
  type: string;      // e.g. "Color", "Size"
  priceModifier: number;
  stock: number;
  sku: string;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  category: ProductCategory | string;
  stock: number;     // Total stock if no variants, otherwise sum of variants
  imageUrls: string[];
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'customer';
  points: number;
  storeCredit: number;
  referralCode: string;
  referralCount: number;
  referredBy?: string; // UID of the person who referred them
  totalReferralEarnings: number;
  createdAt: number;
}

export interface Coupon {
  id?: string;
  code: string;
  description?: string;
  type: 'percentage' | 'flat' | 'free_shipping';
  value: number; 
  expiryDate: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  minimumOrderValue?: number;
  isActive: boolean;
  applicableCategories?: string[]; // category slugs or IDs
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  priceAtPurchase: number;
  totalPrice: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponId?: string;
  couponDiscountAmount?: number;
  pointsDiscountAmount?: number;
  referralCodeUsed?: string;
  pointsEarned: number;
  pointsUsed: number;
  storeCreditUsed: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  status: 'pending' | 'qualified' | 'rewarded';
  rewardAmount: number;
  qualifyingOrderId?: string;
  createdAt: number;
}

export interface ShopAllSettings {
  grid: {
    desktop: number;
    tablet: number;
    mobile: number;
    gap: number;
  };
  card: {
    aspectRatio: 'square' | 'portrait' | 'natural';
    imageFit: 'contain' | 'cover';
    textAlignment: 'left' | 'center' | 'right';
    showBadge: boolean;
    titleSize: 'xs' | 'sm' | 'base';
    priceSize: 'xs' | 'sm' | 'base';
    padding: number;
    borderRadius: number;
  };
}

export interface ReferralSettings {
  referrerRewardPoints: number;
  refereeDiscountPercentage: number;
  referralRequirement: 'first_purchase' | 'every_purchase';
  maxEarningsPerUser: number;
  isActive: boolean;
}

export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'redeem' | 'admin_adjust' | 'referral_bonus';
  reason: string;
  adminId?: string;
  createdAt: number;
}
