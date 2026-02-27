"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { Plus, AlertTriangle, PackageOpen, TrendingDown, Warehouse, Search, Edit3, CheckCircle2 } from "lucide-react"
import { RoleGate } from "@/components/role-gate"
import { cn } from "@/lib/utils"

export default function InventoryPage() {
  const { user } = useAuth()
  const { products, updateProduct } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedQuantity, setEditedQuantity] = useState("")
  const [modalMode, setModalMode] = useState<"edit" | "intake">("edit")

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock)

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateProduct(id, { currentStock: newStock })
      setEditingId(null)
      if (navigator.vibrate) navigator.vibrate(50)
    } catch (error) {
      console.error("Failed to update stock:", error)
    }
  }

  const handleAddStock = (id: string) => {
    setEditingId(id)
    setEditedQuantity("")
    setModalMode("intake")
  }

  // Statlar
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.sellPrice * p.currentStock, 0)
  const lowStockCount = lowStockProducts.length

  return (
    <RoleGate user={user} allowedRoles={["admin", "omborchi", "super-admin", "kassir"]}>
      <main className="flex-1 overflow-auto bg-[#F8FAFC] pb-24 md:pb-12 text-slate-900">
        {/* Premium Header - Compact */}
        <div className="bg-slate-900 text-white p-4 md:p-5 sticky top-0 z-30 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="relative flex justify-between items-center max-w-7xl mx-auto">
            <div className="space-y-0.5">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Ombor Nazorati</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em]">Inventory System</p>
              </div>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-inner">
              <Warehouse className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-4">

          {/* 1. KPI Cards - Stats Section (Compact) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-none shadow-lg shadow-blue-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                  <PackageOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Mahsulotlar</p>
                  <p className="text-xl font-black text-slate-900">{totalProducts}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-green-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-green-50 p-2.5 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Jami Qiymat</p>
                  <p className="text-xl font-black text-slate-900">{totalValue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-red-500/5 bg-white rounded-2xl group hover:scale-[1.01] transition-transform duration-300">
              <CardContent className="p-3 md:p-4 flex items-center gap-4">
                <div className="bg-red-50 p-2.5 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Kam Qoldiq</p>
                  <p className="text-xl font-black text-red-600">{lowStockCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Low Stock Warnings Panel (Compact) */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-[10px] font-black uppercase text-red-900 tracking-widest">Ogohlantirish</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="bg-white border border-red-200 px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm text-[10px] font-bold">
                    <span className="text-slate-700">{p.name}</span>
                    <Badge variant="destructive" className="h-4 bg-red-500 font-bold px-1.5 rounded text-[9px]">
                      {p.currentStock}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Enhanced Search UI (Compact) */}
          <div className="relative group max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <Input
              placeholder="Mahsulot qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 pr-4 rounded-xl bg-white border-2 border-slate-100 shadow-sm text-sm font-bold placeholder:text-slate-300 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
            />
          </div>

          {/* 4. Compact Card Grid Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-10">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <PackageOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">Mahsulot topilmadi</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isLow = product.currentStock <= product.minStock
                const isCritical = product.currentStock <= (product.minStock * 0.5)

                return (
                  <Card
                    key={product.id}
                    className={cn(
                      "group relative border-none rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                      isCritical ? "bg-red-50/50 ring-1 ring-red-100" : isLow ? "bg-amber-50/50 ring-1 ring-amber-100" : "bg-white"
                    )}
                  >
                    <div className="p-3 md:p-4 flex flex-col h-full space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-[12px] md:text-sm text-slate-900 leading-tight uppercase line-clamp-2">
                          {product.name}
                        </h3>
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                          isCritical ? "bg-red-500 animate-pulse" : isLow ? "bg-amber-500 animate-pulse" : "bg-green-500"
                        )} />
                      </div>

                      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-inner">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[7px] uppercase font-bold text-slate-500 tracking-wider">Qoldiq</p>
                            <p className={cn(
                              "text-xl font-black leading-none mt-0.5",
                              isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-white"
                            )}>
                              {product.currentStock}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[7px] uppercase font-bold text-slate-500 tracking-wider">Minimal</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{product.minStock}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-tighter">Narx:</span>
                        <span className="font-black text-slate-800">{product.sellPrice.toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          className="h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[8.5px] active:scale-95 transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                          onClick={() => {
                            setEditingId(product.id)
                            setEditedQuantity(product.currentStock.toString())
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Tahrir</span>
                        </button>
                        <button
                          className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold active:scale-95 transition-all shadow shadow-amber-500/20 flex items-center justify-center gap-1 uppercase tracking-wider text-[8.5px]"
                          onClick={() => handleAddStock(product.id)}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Floating Button - Very Compact */}
        <button className="fixed bottom-24 right-4 w-11 h-11 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-2 border-white">
          <Plus className="w-5 h-5 text-amber-500" />
        </button>

        {/* Compact Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-[260px] border-none shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className={cn(
                "p-5 text-white",
                modalMode === "intake" ? "bg-amber-500" : "bg-slate-900"
              )}>
                <h3 className="text-base font-black uppercase tracking-widest">
                  {modalMode === "intake" ? "Mahsulot Kirimi" : "Qoldiqni tahrirlash"}
                </h3>
                <p className="text-[10px] text-white/70 font-bold truncate mt-1">
                  {products.find(p => p.id === editingId)?.name}
                </p>
              </div>
              <CardContent className="p-5 space-y-5 bg-white">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {modalMode === "intake" ? "Nechta keldi?" : "Yangi qoldiq"}
                  </label>
                  <Input
                    type="number"
                    value={editedQuantity}
                    onChange={(e) => setEditedQuantity(e.target.value)}
                    className="h-14 text-2xl font-black text-center rounded-2xl bg-slate-50 border-none shadow-inner"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="h-12 font-black rounded-xl text-[10px] uppercase tracking-widest text-slate-400"
                    onClick={() => setEditingId(null)}
                  >
                    BEKOR
                  </Button>
                  <Button
                    className={cn(
                      "h-12 font-black rounded-xl text-[10px] uppercase tracking-widest text-white shadow-lg",
                      modalMode === "intake" ? "bg-amber-500 shadow-amber-500/20" : "bg-slate-900 shadow-slate-900/20"
                    )}
                    onClick={() => {
                      const amount = Number(editedQuantity)
                      if (modalMode === "intake") {
                        const product = products.find(p => p.id === editingId)
                        if (product) handleUpdateStock(editingId, product.currentStock + amount)
                      } else {
                        handleUpdateStock(editingId, amount)
                      }
                    }}
                  >
                    SAQLASH
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </RoleGate>
  )
}
