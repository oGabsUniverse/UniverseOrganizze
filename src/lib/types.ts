
export type TransactionType = 'CREDITO' | 'DEBITO';
export type TransactionFrequency = 'FIXO' | 'VARIAVEL';
export type UserRole = 'user' | 'admin';
export type InvestmentType = 'savings' | 'cdb' | 'fii' | 'stock' | 'crypto';
export type DatePeriod = 'week' | 'month' | '3months' | 'all';
export type PhotoType = 'upload' | 'initial' | 'avatar';
export type YieldType = 'CDI' | 'FIXED' | 'IPCA' | 'VARIABLE' | 'MANUAL';
export type AccountType = 'CHECKING' | 'CREDIT_CARD' | 'SAVINGS' | 'CASH';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  partnerId?: string; 
  photoURL?: string | null;
  photoType?: PhotoType;
  avatarId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  name: string;
  owner: string; 
  balance: number;
  color: string;
  type: AccountType;
  limit?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  frequency: TransactionFrequency;
  category: string;
  accountId: string;
  userId: string;
  isAIProcessed?: boolean;
  explanation?: string;
  isAutoSalary?: boolean; 
  isAutoExpense?: boolean; 
  fixedExpenseId?: string; 
  investmentId?: string; 
  monthYear?: string; 
  status: 'confirmed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface ActionLog {
  id: string;
  timestamp: string;
  action: 'add' | 'update' | 'delete';
  entity: 'transaction' | 'account' | 'investment';
  data: any; 
  description: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  institution?: string;
  appliedValue: number;
  currentValue: number;
  goalValue?: number; 
  yieldType: YieldType;
  yieldRate: number; 
  userId: string;
  lastYieldDate?: string;
  history?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dayDue: number;
  category: string;
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAllocation {
  id: string; 
  name: string;
  percentage: number;
  color: string;
}

export interface UserSettings {
  budgetAllocations: BudgetAllocation[];
  plannedMonthlyIncome?: number;
  payday?: number; 
  autoIncomeEnabled?: boolean;
  archivedYears?: number[];
  notifications?: {
    dailyReminder: boolean;
    budgetLimit: boolean;
    weeklyBackup: boolean;
  };
}
