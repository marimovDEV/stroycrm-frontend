"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/hooks/use-auth"
import { RoleGate } from "@/components/role-gate"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const defaultUnits = ["dona", "kg", "m", "m2", "m3", "qop", "rulon", "bank", "korobka"]

function StockStatusBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= minStock) {
    return <Badge variant="destructive">Zaxira Kam</Badge>
  }
  if (stock <= minStock * 1.5) {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-700">
        O'rtacha
      </Badge>
    )
  }
  return <Badge variant="secondary">Zaxirada</Badge>
}

function ProfitMargin({ sellPrice, buyPrice }: { sellPrice: number; buyPrice: number }) {
  const margin = (((sellPrice - buyPrice) / sellPrice) * 100).toFixed(0)
  return <span className="text-sm font-medium text-green-600">{margin}%</span>
}

export function ProductsClient() {
  const { user } = useAuth()
  const { products, updateProduct, deleteProduct, addProduct, stats, loading, categories, addCategory } = useProducts()
  // Add Product Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "", // Initialize empty
    sellPrice: 0,
    buyPrice: 0,
    currentStock: 0,
    minStock: 10,
    unit: "dona"
  })

  // Set default category once categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !newProduct.category) {
      setNewProduct(prev => ({ ...prev, category: categories[0].name }))
    }
  }, [categories])

  const [customCategory, setCustomCategory] = useState("")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customUnit, setCustomUnit] = useState("")
  const [isCustomUnit, setIsCustomUnit] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Barchasi")

  // Edit Product Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isCustomCategoryEdit, setIsCustomCategoryEdit] = useState(false)
  const [customCategoryEdit, setCustomCategoryEdit] = useState("")
  const [isCustomUnitEdit, setIsCustomUnitEdit] = useState(false)
  const [customUnitEdit, setCustomUnitEdit] = useState("")
  // Add Product Submit Handler
  const handleAddProduct = async () => {
    try {
      let finalCategory = newProduct.category
      if (isCustomCategory && customCategory) {
        const newCat = await addCategory(customCategory)
        finalCategory = newCat.name
      }

      const finalProduct = {
        ...newProduct,
        category: finalCategory,
        unit: isCustomUnit ? customUnit : newProduct.unit
      }

      await addProduct(finalProduct)
      setIsAddOpen(false)
      setNewProduct({
        name: "",
        category: categories[0]?.name || "",
        sellPrice: 0,
        buyPrice: 0,
        currentStock: 0,
        minStock: 10,
        unit: "dona"
      })
      setIsCustomCategory(false)
      setCustomCategory("")
      setIsCustomUnit(false)
      setCustomUnit("")
      // Optional: Add success toast
    } catch (e) {
      alert("Xatolik yuz berdi!")
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.barcode.includes(searchQuery)
    const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (confirm("Mahsulotni o'chirishni xohlaysizmi?")) {
      await deleteProduct(id)
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    try {
      let finalCategory = editingProduct.category
      if (isCustomCategoryEdit && customCategoryEdit) {
        const newCat = await addCategory(customCategoryEdit)
        finalCategory = newCat.name
      }

      const finalData: any = {
        ...editingProduct,
        category: finalCategory,
        unit: isCustomUnitEdit ? customUnitEdit : editingProduct.unit
      }

      await updateProduct(editingProduct.id, finalData)
      setIsEditOpen(false)
      setEditingProduct(null)
      setIsCustomCategoryEdit(false)
      setCustomCategoryEdit("")
      setIsCustomUnitEdit(false)
      setCustomUnitEdit("")
    } catch (e) {
      alert("Xatolik yuz berdi!")
    }
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "omborchi", "super-admin", "kassir", "seller"]}>
      <main className="flex-1 overflow-auto">
        {/* Header - Compact on mobile */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3 md:p-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-2xl font-bold">Mahsulotlar</h1>
            <p className="text-slate-300 text-[10px] md:text-sm hidden md:block">Mahsulot kataloginizi boshqaring</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 px-3">
                + Yangi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi Mahsulot Qo'shish</DialogTitle>
                <DialogDescription>Mahsulot ma'lumotlarini kiriting</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nomi</Label>
                  <Input id="name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Kategoriya</Label>
                  <div className="col-span-3 space-y-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={isCustomCategory ? "CUSTOM" : newProduct.category}
                      onChange={e => {
                        if (e.target.value === "CUSTOM") {
                          setIsCustomCategory(true)
                        } else {
                          setIsCustomCategory(false)
                          setNewProduct({ ...newProduct, category: e.target.value })
                        }
                      }}
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      <option value="CUSTOM">+ Yangi qo'shish</option>
                    </select>
                    {isCustomCategory && (
                      <Input
                        placeholder="Yangi kategoriya nomi"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sellPrice" className="text-right">Sotish Narxi</Label>
                  <Input id="sellPrice" type="number" value={newProduct.sellPrice} onChange={e => setNewProduct({ ...newProduct, sellPrice: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buyPrice" className="text-right">Olish Narxi</Label>
                  <Input id="buyPrice" type="number" value={newProduct.buyPrice} onChange={e => setNewProduct({ ...newProduct, buyPrice: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Birlik</Label>
                  <div className="col-span-3 space-y-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={isCustomUnit ? "CUSTOM" : newProduct.unit}
                      onChange={e => {
                        if (e.target.value === "CUSTOM") {
                          setIsCustomUnit(true)
                        } else {
                          setIsCustomUnit(false)
                          setNewProduct({ ...newProduct, unit: e.target.value })
                        }
                      }}
                    >
                      {defaultUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      <option value="CUSTOM">+ Yangi qo'shish</option>
                    </select>
                    {isCustomUnit && (
                      <Input
                        placeholder="Yangi birlik (masalan: kg, m, gisht)"
                        value={customUnit}
                        onChange={e => setCustomUnit(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Zaxira</Label>
                  <Input id="stock" type="number" value={newProduct.currentStock} onChange={e => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minstock" className="text-right">Min Zaxira</Label>
                  <Input id="minstock" type="number" value={newProduct.minStock} onChange={e => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddProduct} type="submit">Saqlash</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-3 md:p-6 space-y-3 md:space-y-6 pb-24 md:pb-6">
          {/* Stats - Compact 2x2 grid on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Mahsulotlar</p>
              <p className="text-lg md:text-2xl font-black text-slate-900 mt-0.5">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Zaxira qiymati</p>
              <p className="text-lg md:text-2xl font-black text-slate-900 mt-0.5">{(stats.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Kam zaxira</p>
              <p className="text-lg md:text-2xl font-black text-red-600 mt-0.5">{stats.lowStockCount}</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">O'rt. Foyda</p>
              <p className="text-lg md:text-2xl font-black text-slate-900 mt-0.5">{stats.avgMargin}%</p>
            </div>
          </div>

          {/* Search & Categories - Compact */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Mahsulot izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              <Button
                variant={selectedCategory === "Barchasi" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Barchasi")}
                className={cn("whitespace-nowrap rounded-full px-3 h-7 text-[11px]", selectedCategory === "Barchasi" ? "bg-slate-700 text-white" : "")}
              >
                Barchasi
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn("whitespace-nowrap rounded-full px-3 h-7 text-[11px]", selectedCategory === cat.name ? "bg-slate-700 text-white" : "")}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products List - Cards on mobile, Table on desktop */}
          {/* Mobile Card List */}
          <div className="md:hidden space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Mahsulot topilmadi</div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{product.category}</span>
                      <span className="text-[10px] text-slate-400">{product.barcode}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-black text-slate-900">{product.sellPrice.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">so'm</span></span>
                      <span className="text-[10px] text-slate-400">Olish: {product.buyPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={cn("text-sm font-black", product.currentStock <= product.minStock ? "text-red-600" : "text-slate-700")}>
                      {product.currentStock}
                    </div>
                    <span className="text-[8px] uppercase font-bold text-slate-400">{product.unit}</span>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingProduct(product); setIsEditOpen(true) }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 size={12} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Mahsulotlar Ro'yxati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Mahsulot</th>
                      <th className="text-left py-3 px-4 font-semibold">Kategoriya</th>
                      <th className="text-right py-3 px-4 font-semibold">Sotish Narxi</th>
                      <th className="text-right py-3 px-4 font-semibold">Xaraj</th>
                      <th className="text-right py-3 px-4 font-semibold">Marjasi</th>
                      <th className="text-right py-3 px-4 font-semibold">Qoldiq</th>
                      <th className="text-center py-3 px-4 font-semibold">Xolati</th>
                      <th className="text-center py-3 px-4 font-semibold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-muted-foreground">
                          Mahsulot topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.barcode}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{product.sellPrice.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {product.buyPrice.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <ProfitMargin sellPrice={product.sellPrice} buyPrice={product.buyPrice} />
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{product.currentStock}</td>
                          <td className="py-3 px-4 text-center">
                            <StockStatusBadge stock={product.currentStock} minStock={product.minStock} />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingProduct(product)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mahsulotni Tahrirlash</DialogTitle>
              <DialogDescription>Mahsulot ma'lumotlarini o'zgartiring</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nomi</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Kategoriya</Label>
                  <div className="col-span-3 space-y-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={isCustomCategoryEdit ? "CUSTOM" : editingProduct.category}
                      onChange={e => {
                        if (e.target.value === "CUSTOM") {
                          setIsCustomCategoryEdit(true)
                        } else {
                          setIsCustomCategoryEdit(false)
                          setEditingProduct({ ...editingProduct, category: e.target.value })
                        }
                      }}
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      <option value="CUSTOM">+ Yangi qo'shish</option>
                    </select>
                    {isCustomCategoryEdit && (
                      <Input
                        placeholder="Yangi kategoriya nomi"
                        value={customCategoryEdit}
                        onChange={e => setCustomCategoryEdit(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-sellPrice" className="text-right">Sotish Narxi</Label>
                  <Input
                    id="edit-sellPrice"
                    type="number"
                    value={editingProduct.sellPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, sellPrice: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-buyPrice" className="text-right">Olish Narxi</Label>
                  <Input
                    id="edit-buyPrice"
                    type="number"
                    value={editingProduct.buyPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, buyPrice: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-unit" className="text-right">Birlik</Label>
                  <div className="col-span-3 space-y-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={isCustomUnitEdit ? "CUSTOM" : editingProduct.unit}
                      onChange={e => {
                        if (e.target.value === "CUSTOM") {
                          setIsCustomUnitEdit(true)
                        } else {
                          setIsCustomUnitEdit(false)
                          setEditingProduct({ ...editingProduct, unit: e.target.value })
                        }
                      }}
                    >
                      {defaultUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      <option value="CUSTOM">+ Yangi qo'shish</option>
                    </select>
                    {isCustomUnitEdit && (
                      <Input
                        placeholder="Yangi birlik"
                        value={customUnitEdit}
                        onChange={e => setCustomUnitEdit(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-minstock" className="text-right">Min Zaxira</Label>
                  <Input
                    id="edit-minstock"
                    type="number"
                    value={editingProduct.minStock}
                    onChange={e => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditProduct} type="submit">Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </RoleGate>
  )
}
