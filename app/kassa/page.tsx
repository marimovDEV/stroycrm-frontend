"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    DollarSign,
    ShoppingBag,
    Printer,
    ChevronRight,
    Loader2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import api from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import type { Sale } from "@/lib/types"

export default function KassaPage() {
    const { user } = useAuth()
    const [pendingOrders, setPendingOrders] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState<Sale | null>(null)
    const iframeRef = React.useRef<HTMLIFrameElement>(null)

    const [todayStats, setTodayStats] = useState({ total_sales: 0 })

    const fetchPendingOrders = useCallback(async () => {
        try {
            const [ordersRes, statsRes] = await Promise.all([
                api.get('/sales/?status=pending&limit=100'),
                api.get('/dashboard/stats/')
            ])
            setPendingOrders(ordersRes.data.results || ordersRes.data)
            setTodayStats(statsRes.data)
        } catch (e) {
            console.error("Failed to fetch kassa data", e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPendingOrders()
        const interval = setInterval(fetchPendingOrders, 10000)
        return () => clearInterval(interval)
    }, [fetchPendingOrders])

    const handleConfirmAction = async (method: string) => {
        if (!selectedOrder) return

        // Qarzga sotish uchun mijoz tanlangan bo'lishi majburiy
        if (method === 'debt' && !selectedOrder.customer_name) {
            alert("Qarzga sotish uchun mijoz tanlangan bo'lishi majburiy!")
            return
        }

        setConfirming(true)
        try {
            const response = await api.post(`/sales/${selectedOrder.id}/confirm-payment/`, { payment_method: method })
            const updatedOrder = response.data

            // Set data for receipt and show it
            setReceiptData(updatedOrder)
            setShowReceipt(true)

            // Auto-print
            setTimeout(() => {
                handlePrintReceipt()
            }, 500)

            setSelectedOrder(null)
            fetchPendingOrders()
        } catch (e: any) {
            console.error("Payment confirmation error:", e)
            const errorMsg = e.response?.data?.error || e.response?.data?.detail || "Xatolik yuz berdi"
            alert(errorMsg)
        } finally {
            setConfirming(false)
        }
    }

    const handlePrintReceipt = async () => {
        const sale = receiptData
        if (!sale) return

        try {
            // Yaratilgan PrintJob API siga murojaat qilib orqa fondan chop etish (Thermal Printer)
            await api.post('/print/', { sale_id: sale.id })
            setShowReceipt(false) // Chek aynasi faqatgina muvaffaqiyatli printdan so'ng xira yopilsin
        } catch (e) {
            console.error("Printerga yuborishda xatolik yuz berdi", e)
            alert("Printerga jo'natib bo'lmadi")
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Buyurtmani bekor qilmoqchimisiz?")) return
        try {
            await api.post(`/sales/${orderId}/cancel-order/`)
            fetchPendingOrders()
            if (selectedOrder?.id === orderId) setSelectedOrder(null)
        } catch (e) {
            alert("Xatolik yuz berdi")
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Yuklanmoqda...</div>
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Kassa Paneli</h1>
                    <p className="text-slate-500">Kutilayotgan buyurtmalar nazorati</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 flex gap-2 items-center">
                    <Clock className="w-4 h-4" /> {pendingOrders.length} ta buyurtma kutilmoqda
                </Badge>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                    <CardContent className="p-5 relative">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Kutilayotganlar</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white">{pendingOrders.length}</h3>
                            <ShoppingBag className="w-5 h-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bugungi qabul (Jami)</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">{Number((todayStats as any).today_sales || 0).toLocaleString()} so'm</h3>
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> Buyurtmalar ro'yxati
                    </h2>
                    <div className="space-y-3 overflow-y-auto max-h-[70vh]">
                        {pendingOrders.length === 0 ? (
                            <Card><CardContent className="p-8 text-center text-slate-400">Hozircha buyurtmalar yo'q</CardContent></Card>
                        ) : (
                            pendingOrders.map(order => (
                                <Card
                                    key={order.id}
                                    className={`cursor-pointer transition-all hover:border-slate-400 ${selectedOrder?.id === order.id ? 'border-amber-500 ring-1 ring-amber-500' : ''}`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-800">{Number(order.total_amount).toLocaleString()} so'm</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <User className="w-3 h-3" /> {order.seller_name || 'Sotuvchi'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(order.created_at).toLocaleTimeString()}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Order Details & Actions */}
                <div className="md:col-span-2">
                    {selectedOrder ? (
                        <Card className="border-t-4 border-t-amber-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                                <CardTitle className="text-xl">Buyurtma: {selectedOrder.receipt_id}</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleCancelOrder(selectedOrder.id)}>
                                        <XCircle className="w-4 h-4 mr-2" /> Bekor qilish
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 font-mono">Ma'lumotlar</p>
                                        <p className="text-sm font-medium">Sotuvchi: {selectedOrder.seller_name}</p>
                                        <p className="text-sm">Vaqt: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-lg text-right">
                                        <p className="text-xs text-amber-600 uppercase font-bold mb-1 font-mono">Umumiy Summa</p>
                                        <p className="text-2xl font-black text-amber-700">{Number(selectedOrder.total_amount).toLocaleString()} so'm</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-sm text-slate-700">Mahsulotlar:</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Nomi</th>
                                                    <th className="px-4 py-2 text-center">Soni</th>
                                                    <th className="px-4 py-2 text-right">Summa</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedOrder.items?.map((item: any) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3">{item.product_name}</td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right font-medium">{Number(item.total).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="pt-6 border-t space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 bg-green-100 text-green-600 p-1 rounded-full" /> To'lov turini tanlang va tasdiqlang
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Button
                                            onClick={() => handleConfirmAction('cash')}
                                            disabled={confirming}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                                        >Naqd</Button>
                                        <Button
                                            onClick={() => handleConfirmAction('card')}
                                            disabled={confirming}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                                        >Karta</Button>
                                        <Button
                                            onClick={() => handleConfirmAction('debt')}
                                            disabled={confirming}
                                            className="bg-slate-700 hover:bg-slate-800 text-white font-bold h-12"
                                        >Qarz</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Buyurtma tanlanmagan</h3>
                            <p className="max-w-xs mx-auto">Tafsilotlarni ko'rish va to'lovni qabul qilish uchun chap tomondagi ro'yxatdan buyurtmani tanlang.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Receipt Preview Dialog */}
            <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-slate-100">
                    <DialogHeader className="p-4 bg-white border-b">
                        <DialogTitle className="text-center font-black uppercase tracking-widest text-slate-800">Chek Preview</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 overflow-y-auto max-h-[70vh] flex justify-center">
                        {/* CSS-based Preview of Thermal Receipt */}
                        <div className="bg-white shadow-xl w-[320px] p-6 font-serif text-black leading-snug border border-slate-200" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                            <div className="text-center mb-5">
                                <h1 className="text-2xl font-black mb-1 tracking-wider">STROYCRM</h1>
                                <p className="text-[10px] uppercase mt-1">QURILISH MOLLARI DO'KONI</p>
                            </div>

                            <div className="text-xs mb-4">
                                <div className="flex flex-col gap-1">
                                    <p>SOTUVCHI: <span className="font-bold">{user?.name || user?.full_name || 'admin'}</span></p>
                                    <p>MIJOZ: <span className="font-bold">{receiptData?.customer_name || 'Umumiy mijoz'}</span></p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-dotted border-slate-400 flex flex-col gap-1">
                                    <p>SANA: {receiptData?.created_at ? new Date(receiptData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                    <p>CHEK №: {receiptData?.receipt_id || receiptData?.id}</p>
                                </div>
                            </div>

                            <div className="mb-4 border-t-2 border-dashed border-slate-200 pt-3">
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-bold pb-2">MAHSULOT</th>
                                            <th className="text-center font-bold pb-2 w-10">SONI</th>
                                            <th className="text-right font-bold pb-2 w-20">SUMMA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptData?.items?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-1 align-top pr-2">{item.product_name}</td>
                                                <td className="py-1 text-center align-top">{parseFloat(item.quantity)}</td>
                                                <td className="py-1 text-right align-top font-bold">{Number(item.total).toLocaleString()} so'm</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t-2 border-dashed border-slate-200 pt-2 pb-1">
                                <div className="flex justify-between items-center text-lg font-black pt-2 border-t-2 border-black">
                                    <span>JAMI:</span>
                                    <span>{Number(receiptData?.total_amount).toLocaleString()} so'm</span>
                                </div>
                            </div>

                            <div className="mt-8 text-center border-t-2 border-dashed border-slate-200 pt-5">
                                <p className="font-bold italic text-base mb-3 text-[13px]">Xaridingiz uchun rahmat!</p>
                                <div className="mb-4">
                                    <p className="font-bold text-[12px] mb-1">Aloqa:</p>
                                    <p className="text-[12px] my-0.5">+998 90 078 08 00</p>
                                    <p className="text-[12px] my-0.5">+998 88 856 13 33</p>
                                </div>

                                <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex flex-col items-center gap-1 opacity-80">
                                    <p className="text-[10px] font-bold font-mono">STROY CRM TIZIMI</p>
                                    <p className="text-[9px] text-slate-600">www.ardentsoft.uz</p>
                                    <p className="text-[9px] text-slate-600">+998 90 557 75 11</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-white border-t flex flex-row gap-2">
                        <Button
                            variant="ghost"
                            className="flex-1 font-bold text-slate-400"
                            onClick={() => setShowReceipt(false)}
                        >
                            YOPISH
                        </Button>
                        <Button
                            className="flex-1 bg-slate-900 font-bold gap-2 rounded-xl h-12"
                            onClick={handlePrintReceipt}
                        >
                            <Printer className="w-4 h-4" /> CHOP ETISH
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden Print Iframe */}
            <iframe
                ref={iframeRef}
                style={{ position: "absolute", width: "0", height: "0", border: "0" }}
                title="Print Receipt"
            />
        </div>
    )
}
