export interface Transaction {
  id: number;
  amount: number;
  description?: string;
  transactionDate: string;
  createdAt: string;
  budgetId?: number;
}

export interface TransactionRequest {
  amount: number;
  description?: string;
  transactionDate: string;
}