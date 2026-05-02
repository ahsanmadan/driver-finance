// TypeScript types for DriverFinance

export interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export interface Shift {
  id: string;
  date: string; // ISO date string, e.g. "2025-05-01"
  platform: string;
  gross_income: number;
  fuel_expense: number;
  food_expense: number;
  parking_expense: number;
  maintenance_expense: number;
  net_income: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  description: string;
  created_at?: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  created_at?: string;
}

// Wallet icon map
export const WALLET_ICONS: Record<string, string> = {
  "Uang Cash": "💵",
  BCA: "🏦",
  ShopeePay: "🛒",
  "Portofolio Investasi": "📈",
};

// Wallet color map (Tailwind classes)
export const WALLET_COLORS: Record<string, string> = {
  "Uang Cash": "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
  BCA: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  ShopeePay: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
  "Portofolio Investasi": "from-purple-500/20 to-purple-600/5 border-purple-500/20",
};
