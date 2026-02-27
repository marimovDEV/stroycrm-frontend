import type { Product, User, Sale, Debt, Inventory } from "./types"

// Bazaviy localStorage boshqaruvi
const STORAGE_KEY = {
  PRODUCTS: "stroy_products",
  USERS: "stroy_users",
  SALES: "stroy_sales",
  DEBTS: "stroy_debts",
  INVENTORY: "stroy_inventory",
  CURRENT_USER: "stroy_current_user",
}

export const StorageService = {
  // Mahsulotlar
  getProducts: (): Product[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY.PRODUCTS)
    return data ? JSON.parse(data) : []
  },

  saveProducts: (products: Product[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY.PRODUCTS, JSON.stringify(products))
  },

  // Xodimlar
  getUsers: (): User[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY.USERS)
    return data ? JSON.parse(data) : []
  },

  saveUsers: (users: User[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY.USERS, JSON.stringify(users))
  },

  // Savdo checkalari
  getSales: (): Sale[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY.SALES)
    return data ? JSON.parse(data) : []
  },

  saveSales: (sales: Sale[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY.SALES, JSON.stringify(sales))
  },

  // Qarzdorlik
  getDebts: (): Debt[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY.DEBTS)
    return data ? JSON.parse(data) : []
  },

  saveDebts: (debts: Debt[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY.DEBTS, JSON.stringify(debts))
  },

  // Inventarizatsiya
  getInventory: (): Inventory[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY.INVENTORY)
    return data ? JSON.parse(data) : []
  },

  saveInventory: (inventory: Inventory[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY.INVENTORY, JSON.stringify(inventory))
  },

  // Joriy foydalanuvchi
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEY.CURRENT_USER)
    return data ? JSON.parse(data) : null
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === "undefined") return
    if (user) {
      localStorage.setItem(STORAGE_KEY.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY.CURRENT_USER)
    }
  },

  // Barcha datani tozalash
  clearAll: () => {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEY).forEach((key) => localStorage.removeItem(key))
  },
}
