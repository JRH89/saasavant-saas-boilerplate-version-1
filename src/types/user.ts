// User data structure stored in Firestore
export interface UserData {
  userId: string;
  email: string;
  isPremium: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  createdAt: number;
  updatedAt: number;
}

// Authentication context type
export interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Pricing plan structure
export interface PricingPlan {
  title: string;
  price: string;
  description: string;
  isPopular: boolean;
  url: string | null;
  features: string[];
  priceId: string;
}
