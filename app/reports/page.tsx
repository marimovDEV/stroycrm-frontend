"use client"

import { useMemo, useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { useReports } from "@/hooks/use-reports"
import { RoleGate } from "@/components/role-gate"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const { user } = useAuth()
  const { products, loading: productsLoading } = useProducts()
  const { reports, loading: reportsLoading, setDateRange } = useReports()

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0)
  }, [products])

  const COLORS = ["#475569", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4"]

  if (productsLoading || reportsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">Yuklanyapti...</p>
        </div>
      </div>
    )
  }

  const data = reports || {
    overview: {
      total_sales: 0,
      sale_count: 0,
      total_profit: 0,
      margin: 0,
      avg_check: 0,
      total_debt_payments: 0
    },
    profitable_products: [],
    payment_stats: [],
    debt_payments: [],
    chart_data: []
  }

  // Map payment method codes to labels and colors
  const PAYMENT_LABELS: Record<string, string> = {
    'cash': 'Naqd',
    'card': 'Karta',
    'debt': 'Qarz'
  }
  const PAYMENT_COLORS: Record<string, string> = {
    'cash': '#22c55e', // green
    'card': '#3b82f6', // blue
    'debt': '#ef4444'  // red
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto bg-slate-50">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <div>
            <h1 className="text-2xl font-black mb-1">Biznes Tahlillari</h1>
            <p className="text-slate-400 text-sm font-medium">Do'koningiz moliyaviy holati va foyda ko'rsatkichlari</p>
          </div>
          <div className="flex gap-2">
            {/* Optional: Add Date picker here later */}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Umumiy Savdo</p>
                <div className="text-2xl font-black text-slate-900">{data.overview.total_sales.toLocaleString()} <span className="text-xs text-slate-400 font-bold">so'm</span></div>
                <div className="mt-2 flex items-center gap-1">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">{data.overview.sale_count} ta chek</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Sof Foyda</p>
                <div className="text-2xl font-black text-green-600">{data.overview.total_profit.toLocaleString()} <span className="text-xs text-green-400 font-bold">so'm</span></div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600">
                  {data.overview.margin}% rentabellik
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Qarz To'lovlari</p>
                <div className="text-2xl font-black text-blue-600">{data.overview.total_debt_payments.toLocaleString()} <span className="text-xs text-blue-400 font-bold">so'm</span></div>
                <div className="mt-2 text-[10px] font-bold text-blue-400 uppercase">Qaytarilgan qarzlar</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">O'rtacha Chek</p>
                <div className="text-2xl font-black text-amber-600">{data.overview.avg_check.toLocaleString()} <span className="text-xs text-amber-400 font-bold">so'm</span></div>
                <div className="mt-2 text-[10px] font-bold text-amber-400 uppercase">Har bir savdoga</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Zaxira Qiymati</p>
                <div className="text-2xl font-black text-slate-900">{inventoryValue.toLocaleString()} <span className="text-xs text-slate-400 font-bold">so'm</span></div>
                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">{products.length} turdagi tovar</div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2 border-b mb-4">
                <CardTitle className="text-base font-black uppercase tracking-widest text-slate-700">Savdo va Foyda Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={3} name="Savdo" dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={3} name="Foyda" dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2 border-b mb-4">
                <CardTitle className="text-base font-black uppercase tracking-widest text-slate-700">To'lov Turlari Taqqoslanishi</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.payment_stats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="payment_method"
                    >
                      {data.payment_stats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.payment_method] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} so'm`, PAYMENT_LABELS[name] || name]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                      formatter={(value: any) => PAYMENT_LABELS[value] || value}
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 3. Bottom Grid: Top Profitable Products and Debt Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profitable Products Table */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 py-4">
                <CardTitle className="text-white text-sm font-black uppercase tracking-widest">Eng Foydali Mahsulotlar (Foyda bo'yicha)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-black">Mahsulot</th>
                        <th className="px-4 py-4 text-center font-black">Soni</th>
                        <th className="px-6 py-4 text-right font-black">Sof Foyda</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.profitable_products.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-extrabold text-slate-800 uppercase text-[11px]">{item.product__name}</td>
                          <td className="px-4 py-4 text-center">
                            <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[10px]">{item.qty} ta</Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-green-600">
                            {Number(item.total_profit).toLocaleString()} <span className="text-[9px] text-slate-400">so'm</span>
                          </td>
                        </tr>
                      ))}
                      {data.profitable_products.length === 0 && (
                        <tr><td colSpan={3} className="p-10 text-center text-slate-400 font-bold">Ma'lumot mavjud emas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Debt Payments Table */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-blue-600 py-4">
                <CardTitle className="text-white text-sm font-black uppercase tracking-widest">Oxirgi Qarz To'lovlari</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-black">Mijoz</th>
                        <th className="px-4 py-4 text-center font-black">Vaqt</th>
                        <th className="px-6 py-4 text-right font-black">Summa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.debt_payments.map((payment: any) => (
                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-slate-800 uppercase text-[11px]">{payment.customer__name}</div>
                            {payment.note && <div className="text-[9px] text-slate-400 lowercase">{payment.note}</div>}
                          </td>
                          <td className="px-4 py-4 text-center text-[10px] font-bold text-slate-500">
                            {new Date(payment.date).toLocaleDateString('uz-UZ')}<br />
                            {new Date(payment.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-blue-600">
                            {Number(payment.amount).toLocaleString()} <span className="text-[9px] text-slate-400">so'm</span>
                          </td>
                        </tr>
                      ))}
                      {data.debt_payments.length === 0 && (
                        <tr><td colSpan={3} className="p-10 text-center text-slate-400 font-bold">Qarz to'lovlari mavjud emas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleGate>
  )
}
