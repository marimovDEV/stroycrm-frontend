"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Lock, Users, Building2, CreditCard, LogOut, CheckCircle, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { StorageService } from "@/lib/storage"
import api from "@/lib/api"
import { RoleGate } from "@/components/role-gate"

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("account")
  const [saved, setSaved] = useState(false)

  const settingsTabs = [
    { id: "account", label: "Hisobim", icon: Users },
    { id: "business", label: "Biznes", icon: Building2 },
    { id: "security", label: "Xavfsizlik", icon: Lock },
    ...(user?.role === "super-admin" ? [{ id: "users", label: "Userlar", icon: Users }] : []),
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <RoleGate user={user} allowedRoles={["admin", "super-admin"]}>
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-1">Sozlamalar</h1>
          <p className="text-slate-200 text-sm">Hisobingiz va tizim sozlamalarini boshqaring</p>
        </div>

        <div className="p-6">
          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="space-y-2 sticky top-24">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id ? "bg-slate-600 text-white font-medium" : "text-foreground hover:bg-muted"
                        }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Settings */}
              {activeTab === "account" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hisobim Sozlamalari</CardTitle>
                    <CardDescription>Hisobingiz ma'lumotlari va imtiyozlarini boshqaring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {saved && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="text-green-600" size={18} />
                        <span className="text-sm text-green-700">O'zgarishlar muvaffaqiyatli saqlandi</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold">Profil Ma'lumotlari</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">To'liq Ismi</label>
                          <Input defaultValue={user?.name || "Foydalanuvchi"} className="mt-1" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rol</label>
                          <Input
                            defaultValue={
                              user?.role === "super-admin"
                                ? "Super Admin"
                                : user?.role === "admin"
                                  ? "Admin"
                                  : user?.role === "kassir"
                                    ? "Kassir"
                                    : "Omborchi"
                            }
                            className="mt-1"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleLogout} variant="destructive" className="gap-2">
                      <LogOut size={18} />
                      Chiqish
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Business Settings */}
              {activeTab === "business" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biznes Sozlamalari</CardTitle>
                    <CardDescription>Sizning do'kon ma'lumotlarini boshqaring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {saved && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="text-green-600" size={18} />
                        <span className="text-sm text-green-700">O'zgarishlar muvaffaqiyatli saqlandi</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold">Do'kon Ma'lumotlari</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Do'kon Nomi</label>
                          <Input defaultValue="Stroy Material Do'koni" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Registratsiya Raqami</label>
                          <Input defaultValue="00001" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Manzil</label>
                          <Input defaultValue="Tashkent, Mirabad Tumani" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Telefon</label>
                          <Input defaultValue="+998 (71) 123-45-67" className="mt-1" />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSave}>Saqlash</Button>
                  </CardContent>
                </Card>
              )}


              {/* Security */}
              {activeTab === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Xavfsizlik</CardTitle>
                    <CardDescription>Hisobingiz xavfsizligini boshqaring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">PIN Kodi</h3>
                      <p className="text-sm text-muted-foreground">Sizning joriy PIN kodi: {user?.pin}</p>
                      <Button variant="outline">PIN Kodini O'zgartirish</Button>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <h3 className="font-semibold">Faol Sessiyalar</h3>
                      <p className="text-sm text-muted-foreground">Siz 1 ta aktiv sessiyada kirgansizviz</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Bu brauzerni (current)</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString("uz-UZ")}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Button variant="destructive" onClick={handleLogout} className="gap-2">
                        <LogOut size={18} />
                        Tizimdan Chiqish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Users Management */}
              {activeTab === "users" && user?.role === "super-admin" && (
                <UsersManagementSection />
              )}
            </div>
          </div>
        </div>
      </main>
    </RoleGate>
  )
}

function UsersManagementSection() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({ id: null, full_name: "", password: "", pin: "" })

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/')
      setEmployees(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  useState(() => {
    fetchEmployees()
  })

  const handleUpdate = async (employeeId: string) => {
    setUpdating(employeeId)
    try {
      const payload: any = { full_name: editData.full_name }
      if (editData.password) payload.password = editData.password
      if (editData.pin) payload.pin = editData.pin

      await api.patch(`/employees/${employeeId}/`, payload)

      alert("Muvaffaqiyatli saqlandi!")
      setEditData({ id: null, full_name: "", password: "", pin: "" })
      fetchEmployees()
    } catch (error) {
      console.error("Update failed:", error)
      alert("Xatolik yuz berdi")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="p-10 text-center">Yuklanmoqda...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foydalanuvchilarni Boshqarish</CardTitle>
        <CardDescription>Xodimlar ismlari, parollari va PIN kodlarini o'zgartirish</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {employees.map((emp) => (
            <div key={emp.id} className="p-4 border rounded-xl space-y-4 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{emp.full_name} (@{emp.username})</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{emp.role} • {emp.position}</p>
                </div>
                <Badge variant="outline" className="bg-white">{emp.pin || "PIN yo'q"}</Badge>
              </div>

              {editData.id === emp.id ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">To'liq Ism</label>
                    <Input
                      value={editData.full_name}
                      onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                      className="h-10 text-sm font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Yangi Parol</label>
                    <Input
                      type="password"
                      placeholder="O'zgartirish uchun..."
                      value={editData.password}
                      onChange={e => setEditData({ ...editData, password: e.target.value })}
                      className="h-10 text-sm font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Yangi PIN</label>
                    <Input
                      placeholder="Masalan: 1234"
                      value={editData.pin}
                      onChange={e => setEditData({ ...editData, pin: e.target.value })}
                      className="h-10 text-sm font-bold bg-white"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditData({ id: null })}>BEKOR</Button>
                    <Button size="sm" onClick={() => handleUpdate(emp.id)} disabled={updating === emp.id}>
                      {updating === emp.id ? "SAQLANMOQDA..." : "SAQLASH"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg font-bold" onClick={() => setEditData({
                    id: emp.id,
                    full_name: emp.full_name,
                    password: "",
                    pin: emp.pin || ""
                  })}>
                    Tahrirlash
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
