/* eslint-disable react/no-unescaped-entities */
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Minus, ShoppingCart, X, Barcode, UserPlus, CreditCard, History, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useProducts } from "@/hooks/use-products"
import { usePOS } from "@/hooks/use-pos"
import { useCustomers } from "@/hooks/use-customers"
import api from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function POSPage() {
  const { user } = useAuth()
  const isSeller = ['seller', 'sotuvchi'].includes(user?.role || "")
  const { customers, addCustomer } = useCustomers()
  const {
    products,
    loading,
    refreshProducts,
    categories,
  } = useProducts()

  const dynamicCategories = useMemo(() => {
    return ["Barchasi", ...categories.map(c => c.name)]
  }, [categories])

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState("Barchasi")
  const [searchQuery, setSearchQuery] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)

  // New Customer Form State
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" })
  const [addingCustomer, setAddingCustomer] = useState(false)



  const {
    cartItems,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    paymentMethod,
    setPaymentMethod,
    discountAmount,
    setDiscountAmount,
    discountPercent,
    setDiscountPercent,
    createOrder,
    confirmPayment,
  } = usePOS()

  // Barcode skaneri - Enter tugmasida mahsulotni qo'shish
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim())
      if (product) {
        addToCart(product, 1)
        setBarcodeInput("")
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totals = calculateTotal(products)

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    // Qarzga sotish uchun mijoz tanlash majburiy
    if (paymentMethod === 'debt' && !selectedCustomerId) {
      alert("Qarzga sotish uchun mijozni tanlash majburiy!")
      return
    }

    try {
      const order = await createOrder(products, user?.id || "default", selectedCustomerId || undefined)
      if (order) {
        if (isSeller) {
          // Seller just creates order, doesn't confirm
          setLastSale(order)
          setShowSuccess(true)
          setSelectedCustomerId("")
          refreshProducts()
          // No auto-print for seller (usually)
        } else {
          // Admin/Cashier confirms immediately
          await confirmPayment(order.id, paymentMethod)
          const completedOrder = { ...order, status: 'completed', payment_method: paymentMethod }
          setLastSale(completedOrder)
          setShowSuccess(true)
          setSelectedCustomerId("")
          refreshProducts()

          // Auto-print receipt
          setTimeout(() => {
            handlePrintReceipt(completedOrder)
          }, 500)
        }
      }
    } catch (e: any) {
      console.error("Checkout error:", e)
      const errorMsg = e.response?.data?.error || e.response?.data?.detail || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
      alert(errorMsg)
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Ism va telefon raqamini kiriting")
      return
    }

    setAddingCustomer(true)
    try {
      const customer = await addCustomer(newCustomer)
      setSelectedCustomerId(customer.id.toString())
      setNewCustomer({ name: "", phone: "" })
      setShowAddCustomer(false)
      // Success feedback would be nice here, maybe a small toast later
    } catch (e: any) {
      console.error("Add customer error:", e)
      const errorMsg = e.response?.data?.phone?.[0] || e.response?.data?.detail || "Mijozni qo'shib bo'lmadi. Ma'lumotlarni tekshiring."
      alert(errorMsg)
    } finally {
      setAddingCustomer(false)
    }
  }
  // Chekni kompyuterdagi printerga yuborish (USB orqali ulangan)
  const handlePrintReceipt = async (saleData?: any) => {
    const sale = saleData || lastSale
    if (!sale) return

    try {
      await api.post('/print/', {
        seller: user?.name || user?.full_name || 'Sotuvchi',
        customer: sale.customer_name || 'Umumiy mijoz',
        receipt_id: sale.receipt_id || sale.id || '',
        date: sale.created_at
          ? new Date(sale.created_at).toLocaleString('uz-UZ')
          : new Date().toLocaleString('uz-UZ'),
        total_amount: sale.total_amount,
        discount_amount: sale.discount_amount || 0,
        payment_method: sale.payment_method || '',
        notes: sale.notes || '',
        items: (sale.items || []).map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      })
    } catch (e) {
      console.error('Printerga yuborishda xatolik:', e)
    }
  }



  // Mobil savat holati
  const [showMobileCart, setShowMobileCart] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">Yuklanyapti...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col md:flex-row h-full bg-background relative overflow-hidden">

      {/* Mobil Header - FAQAT MOBILDA */}
      <div className="md:hidden bg-slate-700 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">Savdo (POS)</h1>
        </div>
        <button
          onClick={() => setShowMobileCart(true)}
          className="relative p-2 bg-slate-600 rounded-lg"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-700">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Mahsulotlar - Chap qism */}
      <div className="flex-1 overflow-auto flex flex-col h-full">
        {/* Desktop Header - FAQAT DESKTOPDA */}
        <div className="hidden md:flex bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Savdo Nuqtasi (POS)</h1>
            <p className="text-slate-200 text-sm">Xush kelibsiz, {user?.full_name || user?.username}!</p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1">
          {/* Search va Kategoriya */}
          <Card className="shadow-sm border-none md:border md:border-border">
            <CardContent className="p-3 md:p-4 space-y-3">
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Mahsulot nomi yoki barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 md:h-10"
                />
              </div>

              {/* Kategoriyalar - Mobil uchun horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {dynamicCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    size="sm"
                    className={cn(
                      "whitespace-nowrap rounded-full px-4 h-9 md:h-8 transition-all",
                      selectedCategory === cat ? "bg-slate-700 text-white shadow-md scale-105" : "text-slate-600 border-slate-200"
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mahsulotlar Grid - Strictly 2 columns on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-24 md:pb-0">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find((item) => item.productId === product.id)
              const cartQuantity = cartItem ? cartItem.quantity : 0
              const displayStock = product.currentStock - cartQuantity
              const isOutOfStock = displayStock <= 0

              const handleAdd = () => {
                if (!isOutOfStock) {
                  addToCart(product, 1)
                  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(50)
                  }
                }
              }

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "hover:shadow-lg transition-all cursor-pointer border-none shadow-sm md:border active:scale-95 group relative overflow-hidden h-full flex flex-col",
                    isOutOfStock && "opacity-60 grayscale pointer-events-none"
                  )}
                  onClick={handleAdd}
                >
                  <div className="p-3 flex flex-col h-full">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2 text-slate-800">{product.name}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-auto">{product.category}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 leading-none">
                          {product.sellPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">so'm / {product.unit}</span>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-1.5 px-2 flex flex-col items-center">
                        <span className={cn("text-[10px] font-bold leading-none", displayStock < 10 ? "text-red-500" : "text-slate-600")}>
                          {displayStock}
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase font-black">{product.unit}</span>
                      </div>
                    </div>

                    {/* Qo'shish tugmasi visual - FAQAT MOBIL STYLE */}
                    <div className="mt-3 md:hidden">
                      <Button size="sm" className="w-full bg-slate-700 hover:bg-slate-800 h-9 rounded-lg">
                        <Plus className="w-4 h-4 mr-1" /> Qo'shish
                      </Button>
                    </div>
                  </div>

                  {/* Savatdagi soni badge */}
                  {cartQuantity > 0 && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-in zoom-in">
                      {cartQuantity}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Mobil Bottom Bar - FAQAT MOBILDA */}
        {cartItems.length > 0 && (
          <div className="md:hidden fixed bottom-20 left-4 right-4 bg-slate-800 text-white p-4 px-6 flex justify-between items-center shadow-2xl z-40 animate-in slide-in-from-bottom duration-300 rounded-2xl border border-slate-700/50 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Jami summa</span>
              <span className="text-lg font-black">{totals.total.toLocaleString()} so'm</span>
            </div>
            <Button
              onClick={() => setShowMobileCart(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 h-12 rounded-xl shadow-lg shadow-amber-500/20"
            >
              SAVAT ({cartItems.length})
            </Button>
          </div>
        )}
      </div>

      {/* Savat va To'lov - O'ng qism (Desktop) / Drawer (Mobil) */}
      <div className={cn(
        "bg-card border-l flex flex-col transition-all duration-300 z-[120]",
        // Desktop holati
        "md:w-[350px] lg:w-[400px] md:relative md:translate-x-0 hidden md:flex",
        // Mobil holati (Drawer)
        showMobileCart && "fixed inset-0 translate-x-0 flex w-full bg-white",
        !showMobileCart && "fixed inset-0 translate-x-full"
      )}>
        {/* Header */}
        <div className="bg-slate-700 text-white p-4 px-6 flex justify-between items-center shadow-md">
          <h2 className="font-black text-lg flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            Savat ({cartItems.length})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-slate-600"
            onClick={() => setShowMobileCart(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                <ShoppingCart className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-black text-sm uppercase tracking-widest">Savat bo'sh</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cartItems.map((item) => {
                const product = products.find((p) => p.id === item.productId)
                if (!product) return null

                return (
                  <div key={item.productId} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col gap-2 relative transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 pr-6">
                        <p className="font-extrabold text-xs text-slate-900 leading-tight uppercase line-clamp-2">{product.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                          {product.sellPrice.toLocaleString()} / {product.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="absolute top-2 right-2 text-slate-200 hover:text-red-500 p-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-1">
                      <div className="flex items-center bg-slate-900 rounded-xl overflow-hidden shadow-md">
                        <button
                          onClick={() => addToCart(product, -1)}
                          className="h-9 w-9 flex items-center justify-center text-white hover:bg-slate-800 active:bg-black transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            if (!isNaN(val) && val >= 0) {
                              setQuantity(product, val)
                            } else if (e.target.value === '' || e.target.value === '0') {
                              setQuantity(product, 0)
                            }
                          }}
                          className="w-12 h-9 text-xs font-black text-center text-white bg-transparent outline-none border-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="h-9 w-9 flex items-center justify-center text-amber-500 hover:bg-slate-800 active:bg-black transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] text-slate-400 font-black uppercase tracking-tighter leading-none mb-1">Summa</p>
                        <p className="font-black text-sm text-slate-900 leading-none">{(product.sellPrice * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chegirma va To'lov Paneli */}
        {cartItems.length > 0 && (
          <div className="border-t bg-white p-5 space-y-4 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
            {/* Stats Summary - Compact */}
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Sub-total:</span>
                <span className="text-slate-600">{totals.subtotal.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between text-[10px] text-green-600 font-bold uppercase tracking-wider">
                <span>Chegirma:</span>
                <span>-{totals.discountAmount.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
                <span className="font-black text-xs text-slate-500 uppercase tracking-[0.2em]">JAMI:</span>
                <span className="font-black text-3xl text-slate-900 tracking-tighter">{totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Inputs Grid - Compact */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10">Chegirma (sum)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="h-10 text-xs font-black bg-slate-50 border-none rounded-xl text-center shadow-inner"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest z-10">Chegirma (%)</label>
                <Input
                  type="number"
                  placeholder="%"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="h-10 text-xs font-black bg-slate-50 border-none rounded-xl text-center shadow-inner"
                />
              </div>
            </div>

            {/* Customer Select - More Modern */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mijoz tanlash</label>
                <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                  <DialogTrigger asChild>
                    <button className="h-9 px-3 text-[10px] font-black text-amber-600 border border-amber-200 bg-amber-50 rounded-lg flex items-center gap-1.5 hover:bg-amber-100 transition-colors active:scale-95 shadow-sm">
                      <UserPlus className="w-3.5 h-3.5" /> YANGI MIJOZ
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Yangi mijoz qo'shish</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Ism familiyasi</Label>
                        <Input
                          id="name"
                          placeholder="Mijoz ismi..."
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefon raqami</Label>
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          placeholder="+998 90 123 45 67"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddCustomer}
                        disabled={addingCustomer}
                        className="bg-slate-900"
                      >
                        {addingCustomer ? "Qo'shilmoqda..." : "Qo'shish"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <select
                  className="flex h-11 w-full rounded-xl border-none bg-slate-50 px-4 py-1 text-xs font-black shadow-inner transition-colors focus:ring-2 focus:ring-slate-400 outline-none appearance-none"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">Umumiy mijoz</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* To'lov turi - Only for Admins/Cashiers */}
            {!isSeller && (
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">To'lov turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Naqd', icon: <DollarSign className="w-3 h-3" /> },
                    { id: 'card', label: 'Karta', icon: <CreditCard className="w-3 h-3" /> },
                    { id: 'debt', label: 'Qarz', icon: <History className="w-3 h-3" /> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-14 gap-1",
                        paymentMethod === method.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                          : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                      )}
                    >
                      {method.icon}
                      <span className="text-[10px] font-black uppercase">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                onClick={clearCart}
                variant="ghost"
                className="h-14 font-black text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-slate-600 uppercase tracking-[0.2em] text-[10px]"
              >
                BEKOR
              </Button>
              <Button
                onClick={handleCheckout}
                className="h-14 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]"
                disabled={cartItems.length === 0}
              >
                {isSeller ? "KASSAGA YUBORISH" : "TASDIQLASH"}
              </Button>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
