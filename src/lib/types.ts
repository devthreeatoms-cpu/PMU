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

export interface ProductOption {
  id: string;
  name: string;      // e.g. "Size"
  values: string[];  // e.g. ["S", "M", "L"]
}

export interface ProductVariant {
  id: string;
  combination: Record<string, string>; // e.g. { "Size": "M", "Color": "Black" }
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;       // Base price
  salePrice?: number;  // Base sale price
  sku?: string;        // Base SKU
  category: ProductCategory | string;
  stock: number;       // Total stock (sum of variants if present)
  imageUrls: string[];
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  hasVariants: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
}

export type UserRole = 'admin' | 'staff' | 'customer';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  [moduleName: string]: ModulePermissions;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: UserPermissions;
  isSuperAdmin?: boolean;
  referralCode?: string;
  referralCount?: number;
  referredBy?: string; // UID of the person who referred them
  totalReferralEarnings?: number;
  hasOrderedBefore?: boolean;
  defaultShippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  cart?: CartItem[];
  cartUpdatedAt?: number;
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

export interface OrderHistoryEvent {
  status: Order['status'];
  timestamp: number;
  message?: string;
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
  couponCode?: string;
  couponDiscountAmount?: number;
  referralCodeUsed?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  history?: OrderHistoryEvent[];
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
  userId: string;
  amount: number;
  type: 'earn' | 'redeem' | 'refund';
  reason: string;
  orderId?: string;
  adminId?: string;
  createdAt: number;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
}
