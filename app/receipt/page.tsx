/* eslint-disable react/no-unescaped-entities */
"use client"

import { useEffect, useState } from "react"

export default function ReceiptPage() {
    const [sale, setSale] = useState<any>(null)
    const [status, setStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle')

    useEffect(() => {
        try {
            const data = localStorage.getItem('printReceipt')
            if (data) {
                setSale(JSON.parse(data))
            }
        } catch (e) {
            console.error('Receipt data error:', e)
        }
    }, [])

    const handlePrint = async () => {
        if (!sale) return
        setStatus('printing')
        try {
            const { default: api } = await import('@/lib/api') // Lazy import
            if (sale.id) {
                await api.post('/print/', { sale_id: sale.id })
            } else {
                await api.post('/print/', sale)
            }
            setStatus('success')
            setTimeout(() => window.close(), 2000)
        } catch (error) {
            console.error('Print failed:', error)
            setStatus('error')
        }
    }

    useEffect(() => {
        if (sale && status === 'idle') {
            // Avtomatik chop etish
            handlePrint()
        }
    }, [sale])

    if (!sale) {
        return <div style={{ padding: 20, textAlign: 'center', fontFamily: 'monospace' }}>Chek ma'lumotlari topilmadi</div>
    }

    const items = sale.items || []

    return (
        <>
            <style jsx global>{`
        @page { size: 80mm auto; margin: 0; }
        * { box-sizing: border-box; }
        body { 
          margin: 0; padding: 0; background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
        }
      `}</style>

            {/* Chop etish statusi/tugmasi — faqat ekranda ko'rinadi */}
            <div className="no-print" style={{
                position: 'fixed', bottom: 20, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 10, zIndex: 100
            }}>
                <button
                    onClick={handlePrint}
                    disabled={status === 'printing' || status === 'success'}
                    style={{
                        padding: '12px 32px', fontSize: 16, fontWeight: 'bold',
                        background: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#1e293b',
                        color: '#fff', border: 'none',
                        borderRadius: 12, cursor: status === 'printing' ? 'wait' : 'pointer'
                    }}
                >
                    {status === 'printing' ? '⏳ Yuborilmoqda...' : status === 'success' ? '✅ Chop etildi!' : status === 'error' ? '❌ Xatolik (Qayta)' : '🖨️ Chop etish'}
                </button>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: '12px 24px', fontSize: 16, fontWeight: 'bold',
                        background: '#e2e8f0', color: '#334155', border: 'none',
                        borderRadius: 12, cursor: 'pointer'
                    }}
                >
                    ✕ Yopish
                </button>
            </div>

            {/* Chek */}
            <div style={{
                fontFamily: "'Times New Roman', Times, serif",
                width: '76mm', maxWidth: '100%',
                margin: '0 auto', padding: '5mm 2mm',
                fontSize: 12, lineHeight: 1.4, color: '#000', background: '#fff'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 15 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '1px' }}>STROYCRM</div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', marginTop: 5 }}>QURILISH MOLLARI DO'KONI</div>
                </div>

                {/* Info */}
                <div style={{ margin: '15px 0', fontSize: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div>SOTUVCHI: <span style={{ fontWeight: 'bold' }}>{sale.seller_name || sale.seller || 'admin'}</span></div>
                        <div>MIJOZ: <span style={{ fontWeight: 'bold' }}>{sale.customer_name || sale.customer || 'Umumiy mijoz'}</span></div>
                    </div>
                    <div style={{ borderTop: '1px dotted #ccc', marginTop: 10, paddingTop: 10 }}>
                        <div>SANA: {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : sale.date}</div>
                        <div>CHEK №: {sale.receipt_id}</div>
                    </div>
                </div>

                {/* Tovarlar */}
                <div style={{ borderTop: '2px dashed #e2e8f0', marginTop: 15, paddingTop: 10 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', fontSize: 11, paddingBottom: 10, fontWeight: 'bold' }}>MAHSULOT</th>
                                <th style={{ textAlign: 'center', fontSize: 11, paddingBottom: 10, fontWeight: 'bold', width: 40 }}>SONI</th>
                                <th style={{ textAlign: 'right', fontSize: 11, paddingBottom: 10, fontWeight: 'bold', width: 80 }}>SUMMA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ padding: '5px 0', fontSize: 11, verticalAlign: 'top' }}>
                                        {item.product_name}
                                    </td>
                                    <td style={{ padding: '5px 0', fontSize: 11, textAlign: 'center', verticalAlign: 'top' }}>
                                        {parseFloat(item.quantity)}
                                    </td>
                                    <td style={{ padding: '5px 0', fontSize: 11, textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold' }}>
                                        {Number(item.total).toLocaleString()} so'm
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Jami */}
                <div style={{ borderTop: '2px dashed #e2e8f0', paddingBottom: 5, marginTop: 10 }}>
                    <div style={{ borderTop: '2px solid #000', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 900 }}>JAMI:</span>
                        <span style={{ fontSize: 18, fontWeight: 900 }}>{Number(sale.total_amount).toLocaleString()} so'm</span>
                    </div>
                    {sale.notes && (
                        <p style={{ marginTop: 10, fontSize: 11 }}>Izoh: {sale.notes}</p>
                    )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 30, textAlign: 'center', borderTop: '2px dashed #e2e8f0', paddingTop: 20 }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontStyle: 'italic', fontSize: 13 }}>Xaridingiz uchun rahmat!</p>
                    <div style={{ margin: '15px 0' }}>
                        <p style={{ margin: '4px 0', fontWeight: 'bold', fontSize: 12 }}>Aloqa:</p>
                        <p style={{ margin: '4px 0', fontSize: 12 }}>+998 90 078 08 00</p>
                        <p style={{ margin: '4px 0', fontSize: 12 }}>+998 88 856 13 33</p>
                    </div>
                    <div style={{ marginTop: 25, fontSize: 9, borderTop: '2px dashed #e2e8f0', paddingTop: 15, opacity: 0.8 }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold', fontSize: 10, fontFamily: "'Courier New', Courier, monospace" }}>STROY CRM TIZIMI</p>
                        <p style={{ margin: '2px 0', color: '#666' }}>www.ardentsoft.uz</p>
                        <p style={{ margin: '2px 0', color: '#666' }}>+998 90 557 75 11</p>
                    </div>
                </div>
            </div>
        </>
    )
}
