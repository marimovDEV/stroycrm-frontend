"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search, Phone, Mail, MapPin } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  city: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  status: "Faol" | "Faol Emas"
  rating: number
}

const mockCustomers: Customer[] = [
  {
    id: "C001",
    name: "ABC Qurilish",
    email: "contact@abcconstruction.com",
    phone: "+1-555-0101",
    company: "ABC Qurilish Ltd",
    address: "123 Main St",
    city: "Tashkent",
    totalOrders: 45,
    totalSpent: 125400,
    lastOrder: "2024-01-15",
    status: "Faol",
    rating: 4.8,
  },
  {
    id: "C002",
    name: "XYZ Quriluvchilar",
    email: "info@xyzbuilders.com",
    phone: "+1-555-0102",
    company: "XYZ Quriluvchilar Inc",
    address: "456 Oak Ave",
    city: "Samarkand",
    totalOrders: 32,
    totalSpent: 87650,
    lastOrder: "2024-01-14",
    status: "Faol",
    rating: 4.5,
  },
  {
    id: "C003",
    name: "BuildRight Co",
    email: "contact@buildright.com",
    phone: "+1-555-0103",
    company: "BuildRight Kompaniyasi",
    address: "789 Pine Rd",
    city: "Bukhara",
    totalOrders: 28,
    totalSpent: 92300,
    lastOrder: "2024-01-13",
    status: "Faol",
    rating: 4.6,
  },
  {
    id: "C004",
    name: "Premium Uy-Joylar",
    email: "sales@premiumhomes.com",
    phone: "+1-555-0104",
    company: "Premium Uy-Joylar Corp",
    address: "321 Elm St",
    city: "Qarshi",
    totalOrders: 18,
    totalSpent: 65200,
    lastOrder: "2024-01-10",
    status: "Faol Emas",
    rating: 4.2,
  },
  {
    id: "C005",
    name: "Sifatli Qurilish",
    email: "orders@qualitybuild.com",
    phone: "+1-555-0105",
    company: "Sifatli Qurilish Echimlari",
    address: "654 Maple Ln",
    city: "Fergona",
    totalOrders: 52,
    totalSpent: 156800,
    lastOrder: "2024-01-16",
    status: "Faol",
    rating: 4.9,
  },
]

function RatingBadge({ rating }: { rating: number }) {
  return (
    <Badge variant={rating >= 4.5 ? "default" : rating >= 4 ? "secondary" : "outline"}>⭐ {rating.toFixed(1)}</Badge>
  )
}

export function CustomersClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch
  })

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id))
  }

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mijozlar va Kontaktlar</h1>
          <p className="text-muted-foreground mt-1">Barcha mijozlarni boshqaring va ularga munosabat quritish.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Yangi Mijoz
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jami Mijozlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jami Daromad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">O'rtacha Buyurtma Qiymati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faol Mijozlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.status === "Faol").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Mijoz nomi, email yoki ID bilan izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{customer.company}</p>
                </div>
                <Badge variant={customer.status === "Faol" ? "default" : "secondary"}>{customer.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.city}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jami Buyurtmalar:</span>
                  <span className="font-medium">{customer.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jami Xarajatlari:</span>
                  <span className="font-medium">${customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Oxirgi Buyurtma:</span>
                  <span className="font-medium">{customer.lastOrder}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Reyting:</span>
                  <RatingBadge rating={customer.rating} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 gap-2 bg-transparent" size="sm">
                  <Edit2 size={16} />
                  Tahrir
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-red-600 hover:text-red-700 bg-transparent"
                  size="sm"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 size={16} />
                  O'chirish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
