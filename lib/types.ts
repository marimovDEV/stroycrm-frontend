// Mahsulot modeli
export interface Product {
  id: string
  barcode: string
  name: string
  category: string
  unit: string // dona, kg, metr
  buyPrice: number
  sellPrice: number
  minStock: number
  currentStock: number
  createdAt: string
}

// Xodim modeli
export interface User {
  id: string
  pin: string
  name: string
  full_name?: string
  username?: string
  role: "super-admin" | "admin" | "kassir" | "omborchi" | "sotuvchi" | "seller"
  avatar?: string
  createdAt: string
}

// Savdo cheki modeli
export interface CartItem {
  productId: string
  quantity: number
  discount: number // summa yoki %
}

export interface Sale {
  id: string
  receipt_id: string
  date: string
  status: "pending" | "completed" | "cancelled"
  items: any[]
  total_amount: number
  discount_amount: number
  payment_method: "cash" | "card" | "transfer" | "debt"
  seller_name?: string
  cashier_name?: string
  customer_name?: string
  subtotal?: number
  created_at: string
}

// Qarzdorlik modeli
export interface Debt {
  id: string
  customerId: string
  customerName: string // Added for display
  amount: number
  dueDate: string
  paidAmount: number
  status: "active" | "paid" | "overdue"
  createdAt: string
}

// Inventarizatsiya modeli
export interface Inventory {
  id: string
  productId: string
  quantity: number
  timestamp: string
  notes?: string
}
