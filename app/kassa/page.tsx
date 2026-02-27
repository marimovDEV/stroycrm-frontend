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
        } catch (e) {
            alert("Xatolik yuz berdi")
        } finally {
            setConfirming(false)
        }
    }

    const handlePrintReceipt = () => {
        const sale = receiptData
        if (!sale || !iframeRef.current) return

        const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page { 
                        size: 80mm auto;
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        width: 76mm; 
                        margin: 0 auto;
                        padding: 5mm 2mm;
                        font-size: 12px; 
                        line-height: 1.1; 
                        color: #000;
                    }
                    .header { text-align: center; margin-bottom: 10px; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px; }
                    .info { margin-bottom: 8px; font-size: 11px; }
                    .info p { margin: 2px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                    .items-table th { text-align: left; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; font-size: 11px; }
                    .items-table td { padding: 4px 0; vertical-align: top; font-size: 11px; }
                    .col-narx { text-align: right; width: 60px; }
                    .col-summa { text-align: right; width: 80px; }
                    .col-soni { text-align: center; width: 40px; }
                    .total-section { border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
                    .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 3px; }
                    .total-row.main { font-size: 16px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
                    .footer { 
                        margin-top: 15px; 
                        text-align: center; 
                        font-size: 11px; 
                        border-top: 1px dashed #000; 
                        padding-top: 10px;
                    }
                    .footer p { margin: 3px 0; }
                    .thank-you { font-weight: bold; font-size: 13px; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <h1>STROYCRM</h1>
                        <p style="text-transform: uppercase; font-size: 9px; letter-spacing: 2px; margin-top: 2px;">Qurilish mollari do'koni</p>
                    </div>
                    
                    <div class="info">
                        <p>SOTUVCHI: <strong>${sale.seller_name || 'Sotuvchi'}</strong></p>
                        <p>KASSIR: <strong>${user?.name || user?.full_name || 'Kassir'}</strong></p>
                        <p>MIJOZ: <strong>${sale.customer_name || 'Umumiy mijoz'}</strong></p>
                        <div style="border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px;">
                            <p>SANA: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p>CHEK №: <strong>${sale.receipt_id}</strong></p>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>MAHSULOT</th>
                                <th class="col-soni">SONI</th>
                                <th class="col-narx">NARX</th>
                                <th class="col-summa">SUMMA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(sale.items || []).map((item: any) => `
                                <tr>
                                    <td style="font-weight: bold; text-transform: uppercase;">${item.product_name}</td>
                                    <td class="col-soni">${parseFloat(item.quantity)}</td>
                                    <td class="col-narx">${Number(item.price).toLocaleString()}</td>
                                    <td class="col-summa">${Number(item.total).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row" style="font-size: 11px;">
                            <span>ORADAN:</span>
                            <span>${Number(sale.subtotal || sale.total_amount + (sale.discount_amount || 0)).toLocaleString()} so'm</span>
                        </div>
                        ${sale.discount_amount > 0 ? `
                        <div class="total-row" style="font-size: 11px; color: #000;">
                            <span>CHEGIRMA:</span>
                            <span>-${Number(sale.discount_amount).toLocaleString()} so'm</span>
                        </div>
                        ` : ''}
                        <div class="total-row main">
                            <span>JAMI :</span>
                            <span>${Number(sale.total_amount).toLocaleString()} so'm</span>
                        </div>
                        <div class="total-row" style="margin-top: 5px; font-size: 10px;">
                            <span>TO'LOV:</span>
                            <span style="text-transform: uppercase;">${sale.payment_method === 'cash' ? 'NAQD' : sale.payment_method === 'card' ? 'PLASTIK' : 'QARZ'}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p class="thank-you">XARIDINGIZ UCHUN RAHMAT!</p>
                        <div style="margin: 10px 0;">
                            <p>+998 90 078 08 00</p>
                            <p>+998 88 856 13 33</p>
                        </div>
                        <div style="margin-top: 15px; font-size: 9px; opacity: 0.8;">
                            <p style="font-weight: bold;">STROY CRM tizimi</p>
                            <p>www.ardentsoft.uz</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return

        doc.open()
        doc.write(receiptHtml)
        doc.close()

        setTimeout(() => {
            if (iframe.contentWindow) {
                iframe.contentWindow.focus()
                iframe.contentWindow.print()
            }
        }, 500)
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
                        <div className="bg-white shadow-xl w-[300px] p-5 font-mono text-[11px] text-black leading-tight border">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-black mb-1">STROYCRM</h1>
                                <p className="text-[9px] uppercase tracking-tighter">Qurilish mollari do'koni</p>
                            </div>

                            <div className="space-y-1 mb-3 pb-2 border-b border-dashed border-slate-300">
                                <p>SOTUVCHI: <span className="font-bold">{user?.name || user?.full_name}</span></p>
                                <p>MIJOZ: <span className="font-bold">{receiptData?.customer_name || 'Umumiy mijoz'}</span></p>
                                <div className="mt-2 pt-2 border-t border-dotted">
                                    <p>SANA: {new Date().toLocaleDateString()}</p>
                                    <p>CHEK №: {receiptData?.receipt_id || receiptData?.id}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex justify-between font-bold border-b border-dashed border-slate-300 pb-1 uppercase">
                                    <span className="w-1/2">MAHSULOT</span>
                                    <span>SONI</span>
                                    <span>SUMMA</span>
                                </div>
                                {receiptData?.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-[10px]">
                                        <span className="w-1/2 truncate">{item.product_name}</span>
                                        <span>{parseFloat(item.quantity)}</span>
                                        <span className="font-bold">{Number(item.total).toLocaleString()} so'm</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                                <div className="flex justify-between text-lg font-black pt-1 border-t-2 border-black">
                                    <span>JAMI:</span>
                                    <span>{Number(receiptData?.total_amount).toLocaleString()} so'm</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center space-y-1 border-t border-dashed border-slate-300 pt-3">
                                <p className="font-bold italic text-xs mb-2">Xaridingiz uchun rahmat!</p>
                                <p className="font-bold mb-1">Aloqa:</p>
                                <p>+998 90 078 08 00</p>
                                <p>+998 88 856 13 33</p>

                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex flex-col items-center gap-0.5 opacity-80">
                                    <p className="text-[9px] font-black uppercase tracking-tighter">STROY CRM tizimi</p>
                                    <p className="text-[8px]">www.ardentsoft.uz</p>
                                    <p className="text-[8px]">+998 90 557 75 11</p>
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
