"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useDebts } from "@/hooks/use-debts"
import { AlertTriangle, Clock, DollarSign, TrendingUp, Search, Plus } from "lucide-react"
import { RoleGate } from "@/components/role-gate"
import { cn } from "@/lib/utils"

export default function DebtsPage() {
  const { user } = useAuth()
  const { debts, totalDebt, overdueDebt, payDebt, addDebt } = useDebts()
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    amount: "",
    dueDate: "",
    notes: "",
  })
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({}) // New state to hold pay amounts for each debt

  const filteredDebts = debts.filter((d) => d.customerName.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddDebt = () => {
    if (formData.customerName && formData.amount) {
      addDebt({
        id: "",
        customerId: formData.customerName, // This logic needs backend support later
        customerName: formData.customerName,
        amount: Number(formData.amount),
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        paidAmount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      })
      setFormData({ customerName: "", amount: "", dueDate: "", notes: "" })
      setShowForm(false)
    }
  }

  const handlePayment = (debtId: string, amount: string) => {
    const paidAmount = Number(amount)
    if (paidAmount > 0) {
      payDebt(debtId, paidAmount)
      setPayAmounts((prev) => ({ ...prev, [debtId]: "" })) // Reset pay amount after payment
    }
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin", "kassir", "seller"]}>
      <main className="flex-1 overflow-auto bg-[#F8FAFC] pb-24 md:pb-12 text-slate-900">
        {/* Premium Header - Sticky & Compact */}
        <div className="bg-slate-900 text-white p-4 md:p-5 sticky top-0 z-30 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="relative flex justify-between items-center max-w-7xl mx-auto">
            <div className="space-y-0.5">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Qarzdorlik</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em]">Debt Management</p>
              </div>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-inner">
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-4">

          {/* 1. KPI Cards - Stats Section (Compact) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-none shadow-lg shadow-red-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-red-50 p-2.5 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <DollarSign className="w-5 h-5 text-red-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Jami Qarz</p>
                  <p className="text-xl font-black text-slate-900">{totalDebt.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-orange-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-orange-50 p-2.5 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <AlertTriangle className="w-5 h-5 text-orange-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Muddati o'tgan</p>
                  <p className="text-xl font-black text-orange-600 group-hover:text-white">{overdueDebt.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-blue-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                  <TrendingUp className="w-5 h-5 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Faol Mijozlar</p>
                  <p className="text-xl font-black text-slate-900">{debts.filter((d) => d.status !== "paid").length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Critical/Overdue Section (Horizontal Scroll) */}
          {debts.filter((d) => d.status === "overdue").length > 0 && (
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-red-500" />
                <h3 className="text-[10px] font-black uppercase text-red-900 tracking-widest">Muddati o'tganlar</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {debts.filter((d) => d.status === "overdue").map((p) => (
                  <div key={p.id} className="bg-white border border-red-200 px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm text-[10px] font-bold">
                    <span className="text-slate-700">{p.customerName}</span>
                    <Badge variant="destructive" className="h-4 bg-red-500 font-bold px-1.5 rounded text-[9px]">
                      {p.amount.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Search UI */}
          <div className="relative group max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <Input
              placeholder="Mijozni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 pr-4 rounded-xl bg-white border-2 border-slate-100 shadow-sm text-sm font-bold placeholder:text-slate-300 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
            />
          </div>

          {/* 4. Compact Card Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-10">
            {filteredDebts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Qarzdorlar topilmadi</p>
              </div>
            ) : (
              filteredDebts.map((debt) => {
                const remaining = debt.amount - debt.paidAmount
                const payAmount = payAmounts[debt.id] || ""
                const isOverdue = debt.status === "overdue"
                const isPaid = debt.status === "paid"

                return (
                  <Card
                    key={debt.id}
                    className={cn(
                      "group relative border-none rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                      isOverdue ? "bg-red-50/50 ring-1 ring-red-100" : isPaid ? "bg-blue-50/50" : "bg-white"
                    )}
                  >
                    <div className="p-4 md:p-5 flex flex-col h-full space-y-4">
                      {/* Customer Info */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h3 className="font-black text-sm text-slate-900 leading-tight uppercase line-clamp-1">
                            {debt.customerName}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            To'lov muddati: {debt.dueDate}
                          </p>
                        </div>
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full ring-2 flex-shrink-0 mt-1",
                          isOverdue ? "bg-red-500 ring-red-100 animate-pulse" : isPaid ? "bg-blue-500 ring-blue-50" : "bg-green-500 ring-green-50"
                        )} />
                      </div>

                      {/* Debt Info (Compact Area) */}
                      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-inner">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Qolgan qarz</p>
                            <p className={cn(
                              "text-xl font-black leading-none mt-1",
                              isOverdue ? "text-red-400" : "text-white"
                            )}>
                              {remaining.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] uppercase font-bold text-slate-500 tracking-wider">Jami summa</p>
                            <p className="text-xs font-bold text-slate-300 mt-1">{debt.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Action */}
                      {!isPaid && (
                        <div className="space-y-2">
                          <div className="relative group/input">
                            <Input
                              type="number"
                              value={payAmount}
                              onChange={(e) => setPayAmounts({ ...payAmounts, [debt.id]: e.target.value })}
                              placeholder="To'lov summasi..."
                              className="h-11 rounded-xl bg-slate-50 border-none shadow-inner text-sm font-bold pl-4 text-center focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <Button
                            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-black active:scale-95 transition-all text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10"
                            onClick={() => {
                              handlePayment(debt.id, payAmount)
                              if (navigator.vibrate) navigator.vibrate(50)
                            }}
                            disabled={!payAmount || Number(payAmount) <= 0}
                          >
                            To'lovni tasdiqlash
                          </Button>
                        </div>
                      )}

                      {/* Success History Action */}
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-400 uppercase">To'langan:</span>
                        <span className="font-black text-green-600">{debt.paidAmount.toLocaleString()} so'm</span>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="fixed bottom-24 right-4 w-12 h-12 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-white"
        >
          <Plus className="w-6 h-6 text-red-500" />
        </button>

        {/* Add Debt Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-sm border-none shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-slate-900 p-6 text-white text-center">
                <h3 className="text-xl font-black tracking-tight">Yangi Qarz</h3>
                <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold">Mijoz va summada ehtiyot bo'ling</p>
              </div>
              <CardContent className="p-6 space-y-5 bg-white">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Mijoz Ismi</label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Mijoz nomi..."
                      className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Summa</label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Muddat</label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="h-12 font-bold rounded-xl text-[10px] uppercase tracking-widest border-2" onClick={() => setShowForm(false)}>BEKOR QILISH</Button>
                  <Button className="h-12 font-bold rounded-xl bg-slate-900 text-white text-[10px] uppercase tracking-widest shadow-lg" onClick={handleAddDebt}>SAQLASH</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </RoleGate>
  )
}
