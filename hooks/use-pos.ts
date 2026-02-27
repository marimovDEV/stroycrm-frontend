"use client"

import { useState, useCallback } from "react"
import type { CartItem, Sale, Product } from "@/lib/types"
import api from "@/lib/api"

export function usePOS() {
  const [cartItems, setCartItems] = useState<Map<string, CartItem>>(new Map())
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "debt">("cash")

  // Mahsulotni sahuga qo'shish
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(product.id)

      if (existing) {
        const newQty = existing.quantity + quantity
        if (newQty <= 0) {
          newCart.delete(product.id)
        } else if (newQty <= product.currentStock) {
          newCart.set(product.id, { ...existing, quantity: newQty })
        }
      } else {
        if (quantity > 0 && quantity <= product.currentStock) {
          newCart.set(product.id, { productId: product.id, quantity, discount: 0 })
        }
      }

      return newCart
    })
  }, [])

  // Sonni aniq o'rnatish (qo'lda yozish uchun)
  const setQuantity = useCallback((product: Product, qty: number) => {
    setCartItems((prev) => {
      const newCart = new Map(prev)
      const safeQty = Math.max(0, Math.min(qty, product.currentStock))
      if (safeQty <= 0) {
        newCart.delete(product.id)
      } else {
        const existing = newCart.get(product.id)
        if (existing) {
          newCart.set(product.id, { ...existing, quantity: safeQty })
        } else {
          newCart.set(product.id, { productId: product.id, quantity: safeQty, discount: 0 })
        }
      }
      return newCart
    })
  }, [])

  // Sahutdan olib tashlash
  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => {
      const newCart = new Map(prev)
      newCart.delete(productId)
      return newCart
    })
  }, [])

  // Sahuning umumiy summasini hisoblash
  const calculateTotal = useCallback(
    (products: Product[]) => {
      let total = 0

      cartItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          total += product.sellPrice * item.quantity
        }
      })

      let finalTotal = total

      if (discountPercent > 0) {
        finalTotal = total - (total * discountPercent) / 100
      } else if (discountAmount > 0) {
        finalTotal = total - discountAmount
      }

      return {
        subtotal: total,
        discountAmount: discountPercent > 0 ? (total * discountPercent) / 100 : discountAmount,
        total: Math.max(0, finalTotal),
      }
    },
    [cartItems, discountAmount, discountPercent],
  )

  // Sahuni tozalash
  const clearCart = useCallback(() => {
    setCartItems(new Map())
    setDiscountAmount(0)
    setDiscountPercent(0)
  }, [])

  // Buyurtma yaratish (Pending)
  const createOrder = useCallback(
    async (products: Product[], userId: string, customerId?: string) => {
      if (cartItems.size === 0) return null

      const cartArray = Array.from(cartItems.values())
      const totals = calculateTotal(products)

      const saleData = {
        customer: customerId || null,
        total_amount: totals.total,
        discount_amount: totals.discountAmount,
        payment_method: paymentMethod, // Will be 'cash' by default for pending
        items: cartArray.map(item => {
          const product = products.find(p => p.id === item.productId)
          const price = product?.sellPrice || 0
          return {
            product: item.productId,
            quantity: item.quantity,
            price: price,
            total: price * item.quantity
          }
        }),
      }

      try {
        const response = await api.post('/sales/', saleData);
        clearCart()
        return response.data;
      } catch (error) {
        console.error("Order creation failed:", error)
        throw error;
      }
    },
    [cartItems, paymentMethod, calculateTotal, clearCart],
  )

  // To'lovni tasdiqlash
  const confirmPayment = useCallback(async (saleId: string, method: string) => {
    try {
      const response = await api.post(`/sales/${saleId}/confirm-payment/`, { payment_method: method });
      return response.data;
    } catch (error) {
      console.error("Payment confirmation failed:", error)
      throw error;
    }
  }, [])

  // Buyurtmani bekor qilish
  const cancelOrder = useCallback(async (saleId: string) => {
    try {
      const response = await api.post(`/sales/${saleId}/cancel-order/`);
      return response.data;
    } catch (error) {
      console.error("Order cancellation failed:", error)
      throw error;
    }
  }, [])

  return {
    cartItems: Array.from(cartItems.values()),
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    createOrder,
    confirmPayment,
    cancelOrder,
    setDiscountAmount,
    setDiscountPercent,
    discountAmount,
    discountPercent,
    paymentMethod,
    setPaymentMethod,
  }
}
