"use client"

import { useState, useCallback, useEffect } from "react"
import type { Debt } from "@/lib/types"
import api from "@/lib/api"

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      // We need to fetch customers who have debt
      // Using 'debt__gt=0' filter if backend supports it, or filtering on client
      const response = await api.get('/customers/?debt__gt=0');

      const mappedDebts: Debt[] = response.data.results.map((c: any) => ({
        id: `debt_c_${c.id}`, // Virtual ID since debt is on customer model
        customerId: String(c.id),
        // Since we don't have a specific 'Debt' model instance for the aggregate, 
        // we might map customer fields directly.
        // However, the frontend expects a 'Debt' type which seems to map to a specific transaction or aggregate state?
        // Looking at 'types.ts', Debt has 'amount', 'paidAmount', 'status'.
        // The backend Customer model has 'debt' (current balance).
        // Let's assume for this view we just want to show active debts.
        amount: Number(c.debt),
        paidAmount: 0, // In this model, 'debt' is remaining balance, so paid is tracked elsewhere or implicitly 0 relative to current balance
        dueDate: new Date().toISOString(), // Backend doesn't seem to have due date on customer
        status: "active",
        createdAt: c.created_at || new Date().toISOString(),
        customerName: c.name,
        phone: c.phone
      }));

      setDebts(mappedDebts);
    } catch (error) {
      console.error("Failed to fetch debts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts])

  const addDebt = useCallback(
    async (debt: Debt) => {
      // Backend likely handles debt creation via Sales
      console.warn("Direct debt creation not fully supported via API hook yet, use Sales.");
      return debt;
    },
    [],
  )

  const updateDebt = useCallback(
    async (debt: Debt) => {
      console.warn("Debt update should happen via transactions");
    },
    [],
  )

  const payDebt = useCallback(
    async (debtId: string, amount: number) => {
      try {
        // debtId in our virtual mapping is 'debt_c_{id}'
        const customerId = debtId.replace('debt_c_', '');
        await api.post('/debt-transactions/', {
          customer: customerId,
          transaction_type: 'payment', // Check backend choices
          amount: amount,
        });
        // Refresh debts
        fetchDebts();
      } catch (error) {
        console.error("Failed to pay debt:", error);
      }
    },
    [fetchDebts],
  )

  // Calculate totals from fetched data
  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)
  const overdueDebt = 0; // Backend doesn't track overdue status explicitly yet

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    payDebt,
    totalDebt,
    overdueDebt,
    refreshDebts: fetchDebts
  }
}
