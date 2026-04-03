
"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { Transaction, BankAccount, UserProfile, Investment, BudgetAllocation, FixedExpense, ActionLog } from '@/lib/types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking
} from '@/firebase';
import { collection, doc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

interface FinanceContextType {
  userProfile: UserProfile | null;
  accounts: BankAccount[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  investments: Investment[];
  fixedExpenses: FixedExpense[];
  budget: BudgetAllocation[];
  plannedMonthlyIncome: number;
  payday: number;
  viewDate: Date;
  setViewDate: (date: Date) => void;
  addTransaction: (t: any) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (a: any) => void;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number) => void;
  addInvestment: (i: any) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addFixedExpense: (e: any) => void;
  deleteFixedExpense: (id: string) => void;
  updateBudget: (allocations: BudgetAllocation[], plannedIncome: number, payday?: number) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  undoLastAction: () => void;
  actionLogs: ActionLog[];
  isOnline: boolean;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<void>;
  verifyIntegrity: () => { ok: boolean; issues: string[] };
  repairData: () => Promise<void>;
  isLoading: boolean;
  isEssentialLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const defaultBudget: BudgetAllocation[] = [
  { id: 'cat_needs', name: 'Necessidades', percentage: 50, color: '#8A2BE2' },
  { id: 'cat_leisure', name: 'Lazer', percentage: 15, color: '#3B82F6' },
  { id: 'cat_knowledge', name: 'Conhecimento', percentage: 10, color: '#C084FC' },
  { id: 'cat_investments', name: 'Investimentos', percentage: 25, color: '#1E3A8A' },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [plannedMonthlyIncome, setPlannedMonthlyIncome] = useState(0);
  const [payday, setPayday] = useState(5);

  useEffect(() => {
    setViewDate(new Date());
  }, []);

  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userProfileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const accountsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'accounts')) : null, [db, user]);
  const { data: accounts = [], isLoading: isAccountsLoading } = useCollection<BankAccount>(accountsQuery);

  const transactionsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc')) : null, [db, user]);
  const { data: transactions = [], isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const investmentsQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'investments')) : null, [db, user]);
  const { data: investments = [], isLoading: isInvestmentsLoading } = useCollection<Investment>(investmentsQuery);

  const fixedExpensesQuery = useMemoFirebase(() => user ? query(collection(db, 'users', user.uid, 'fixedExpenses')) : null, [db, user]);
  const { data: fixedExpenses = [], isLoading: isFixedLoading } = useCollection<FixedExpense>(fixedExpensesQuery);

  const budgetQuery = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'settings', 'budget') : null, [db, user]);
  const { data: budgetData } = useDoc<any>(budgetQuery);

  const budget = useMemo(() => budgetData?.allocations || defaultBudget, [budgetData]);

  useEffect(() => {
    if (budgetData) {
      setPlannedMonthlyIncome(budgetData.plannedMonthlyIncome || 0);
      setPayday(budgetData.payday || 5);
    }
  }, [budgetData]);

  const filteredTransactions = useMemo(() => {
    const txList = transactions || [];
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    return txList.filter(t => {
      if (!t || !t.date) return false;
      const tDate = parseISO(t.date);
      return isWithinInterval(tDate, { start: monthStart, end: monthEnd });
    });
  }, [transactions, viewDate]);

  const addTransaction = useCallback((t: any) => {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'transactions');
    addDocumentNonBlocking(colRef, {
      ...t,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (t.accountId) {
      const accRef = doc(db, 'users', user.uid, 'accounts', t.accountId);
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) {
        const adj = t.type === 'CREDITO' ? t.amount : -t.amount;
        updateDocumentNonBlocking(accRef, { balance: acc.balance + adj, updatedAt: new Date().toISOString() });
      }
    }
    toast({ title: "Lançamento realizado!" });
  }, [db, user, accounts, toast]);

  const deleteTransaction = useCallback((id: string) => {
    if (!user) return;
    const t = transactions.find(tx => tx.id === id);
    if (t) {
      // Revert Account Balance
      if (t.accountId) {
        const accRef = doc(db, 'users', user.uid, 'accounts', t.accountId);
        const acc = accounts.find(a => a.id === t.accountId);
        if (acc) {
          const adj = t.type === 'CREDITO' ? -t.amount : t.amount;
          updateDocumentNonBlocking(accRef, { balance: acc.balance + adj });
        }
      }

      // Sync Investment if linked
      if (t.investmentId) {
        const invId = t.investmentId;
        const inv = (investments || []).find(i => i.id === invId);
        if (inv) {
          const invRef = doc(db, 'users', user.uid, 'investments', invId);
          // If we deleted an Aporte (DEBITO), we subtract from investment
          // If we deleted a Resgate (CREDITO), we add back to investment
          const invAdj = t.type === 'DEBITO' ? -t.amount : t.amount;
          updateDocumentNonBlocking(invRef, {
            currentValue: Math.max(0, inv.currentValue + invAdj),
            appliedValue: Math.max(0, inv.appliedValue + invAdj),
            updatedAt: new Date().toISOString()
          });
        }
      }

      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'transactions', id));
      toast({ title: "Lançamento removido." });
    }
  }, [db, user, transactions, accounts, investments, toast]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'transactions', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const addAccount = useCallback((a: any) => {
    if (!user) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'accounts'), {
      ...a,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const updateAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'accounts', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const deleteAccount = useCallback((id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'accounts', id));
  }, [db, user]);

  const transferBetweenAccounts = useCallback((fromId: string, toId: string, amount: number) => {
    if (!user) return;
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    if (fromAcc && toAcc) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'accounts', fromId), { balance: fromAcc.balance - amount });
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'accounts', toId), { balance: toAcc.balance + amount });
      toast({ title: "Transferência realizada!" });
    }
  }, [db, user, accounts, toast]);

  const addInvestment = useCallback((i: any) => {
    if (!user) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'investments'), {
      ...i,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'investments', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const deleteInvestment = useCallback((id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'investments', id));
  }, [db, user]);

  const addFixedExpense = useCallback((e: any) => {
    if (!user) return;
    addDocumentNonBlocking(collection(db, 'users', user.uid, 'fixedExpenses'), {
      ...e,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }, [db, user]);

  const deleteFixedExpense = useCallback((id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'fixedExpenses', id));
  }, [db, user]);

  const updateBudget = (allocations: BudgetAllocation[], plannedIncome: number, paydayVal?: number) => {
    if (!user) return;
    setDocumentNonBlocking(doc(db, 'users', user.uid, 'settings', 'budget'), {
      allocations,
      plannedMonthlyIncome: plannedIncome,
      payday: paydayVal !== undefined ? paydayVal : payday,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(db, 'users', user.uid), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  };

  const exportData = async () => {
    const data = {
      profile: userProfileData,
      accounts,
      transactions,
      investments,
      fixedExpenses,
      budget
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-universe-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = async (jsonData: string) => {
    toast({ title: "Função indisponível para Web" });
  };

  const isLoading = isUserLoading || isProfileLoading || isAccountsLoading || isTransactionsLoading || isInvestmentsLoading || isFixedLoading;

  const value = {
    userProfile: userProfileData,
    accounts,
    transactions,
    filteredTransactions,
    investments,
    fixedExpenses,
    budget,
    plannedMonthlyIncome,
    payday,
    viewDate,
    setViewDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addFixedExpense,
    deleteFixedExpense,
    updateBudget,
    updateProfile,
    undoLastAction: () => {},
    actionLogs: [],
    isOnline: true,
    exportData,
    importData,
    verifyIntegrity: () => ({ ok: true, issues: [] }),
    repairData: async () => {},
    isLoading,
    isEssentialLoading: isUserLoading
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}
