export interface Budget {
  id: number;
  name: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageSpent: number;
  month: number;
  year: number;
  createdAt: string;
}