"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AlertCircle, Package, Users, DollarSign, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { useDashboard } from "@/hooks/use-dashboard"
import { RoleGate } from "@/components/role-gate"

export default function DashboardPage() {
  const { user } = useAuth()
  const { products, loading: productsLoading } = useProducts()
  const { stats: dashboardStats, loading: dashboardLoading } = useDashboard()

  const COLORS = ["#475569", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4"]

  const stats = dashboardStats || {
    today_sales: 0,
    today_profit: 0,
    total_debt: 0,
    inventory_value: 0,
    category_breakdown: [],
    low_stock_products: [],
    top_products: [],
    chart_data: []
  }

  if (dashboardLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Bosh Panel</h1>
            <p className="text-slate-200 text-sm">Xush kelibsiz, {user?.name}! Bugungi statistikalar</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
            Sana: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-none shadow-sm bg-blue-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bugungi Savdo</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.today_sales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Foyda: {stats.today_profit.toLocaleString()} so'm</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-red-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Umumiy Qarz</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_debt.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 text-red-600 font-medium">Qaytarilishi kerak</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-slate-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zaxira Qiymati</CardTitle>
                <Package className="w-4 h-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inventory_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{products.length} turdagi mahsulot</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-orange-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kam Qoldiq</CardTitle>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.low_stock_products.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Mahsulotlarni to'ldirish kerak</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle>Savdo Trendi (7 kunlik)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#475569" strokeWidth={3} dot={{ fill: '#475569' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Kategoriya Taqsimoti</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.category_breakdown}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80} paddingAngle={5}
                      dataKey="value"
                      nameKey="category"
                    >
                      {stats.category_breakdown.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Eng Ko'p Sotilganlar</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_products.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-sm">{item.product__name}</p>
                        <p className="text-xs text-muted-foreground">Sotilgan miqdor</p>
                      </div>
                      <Badge variant="secondary">{item.quantity} ta</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Kam Qoldiq Mahsulotlar</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.low_stock_products.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-red-500">Qoldiq: {product.stock} {product.base_unit}</p>
                      </div>
                      <Badge variant="outline">Min: {product.min_stock}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleGate>
  )
}
