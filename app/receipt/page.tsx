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
                fontFamily: "'Courier New', Courier, monospace",
                width: '76mm', maxWidth: '100%',
                margin: '0 auto', padding: '2mm 1mm',
                fontSize: 11, lineHeight: 1.3, color: '#000', background: '#fff'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 5, borderBottom: '1px dashed #000', paddingBottom: 5 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>STROY CRM</div>
                </div>

                {/* Info */}
                <div style={{ margin: '5px 0', fontSize: 10, borderBottom: '1px dashed #000', paddingBottom: 5 }}>
                    <p style={{ margin: '2px 0' }}>Sotuvchi: {sale.seller}</p>
                    <p style={{ margin: '2px 0' }}>Mijoz: {sale.customer}</p>
                    <div style={{ borderTop: '1px dashed #000', marginTop: 5, paddingTop: 5 }}>
                        <p style={{ margin: '2px 0' }}>Sana: {sale.date}</p>
                        <p style={{ margin: '2px 0' }}>Chek №: {sale.receipt_id}</p>
                    </div>
                </div>

                {/* Tovarlar */}
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '5px 0' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #000', fontSize: 10, padding: '2px 0' }}>Tovar</th>
                            <th style={{ textAlign: 'center', borderBottom: '1px solid #000', fontSize: 10, padding: '2px 0', width: 30 }}>Soni</th>
                            <th style={{ textAlign: 'right', borderBottom: '1px solid #000', fontSize: 10, padding: '2px 0', width: 55 }}>Narxi</th>
                            <th style={{ textAlign: 'right', borderBottom: '1px solid #000', fontSize: 10, padding: '2px 0', width: 65 }}>Summa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, i: number) => (
                            <tr key={i}>
                                <td style={{ padding: '3px 0', fontSize: 10, borderBottom: '0.5px solid #eee', verticalAlign: 'top' }}>
                                    {item.product_name}
                                </td>
                                <td style={{ padding: '3px 0', fontSize: 10, borderBottom: '0.5px solid #eee', textAlign: 'center' }}>
                                    {parseFloat(item.quantity)}
                                </td>
                                <td style={{ padding: '3px 0', fontSize: 10, borderBottom: '0.5px solid #eee', textAlign: 'right' }}>
                                    {Number(item.price).toLocaleString()}
                                </td>
                                <td style={{ padding: '3px 0', fontSize: 10, borderBottom: '0.5px solid #eee', textAlign: 'right' }}>
                                    {Number(item.total).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Jami */}
                <div style={{ borderTop: '2px solid #000', paddingTop: 5, marginTop: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 14, marginTop: 5 }}>
                        <span>JAMI:</span>
                        <span>{Number(sale.total_amount).toLocaleString()} so'm</span>
                    </div>
                    {sale.notes && (
                        <p style={{ marginTop: 10, fontSize: 10 }}>Izoh: {sale.notes}</p>
                    )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 15, textAlign: 'center', fontSize: 10, borderTop: '1px dashed #000', paddingTop: 8, paddingBottom: 15 }}>
                    <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Xaridingiz uchun rahmat!</p>
                    <div style={{ margin: '10px 0' }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Aloqa:</p>
                        <p style={{ margin: '2px 0' }}>+998 90 078 08 00</p>
                        <p style={{ margin: '2px 0' }}>+998 88 856 13 33</p>
                    </div>
                    <div style={{ marginTop: 15, fontSize: 9, borderTop: '1px dashed #000', paddingTop: 10 }}>
                        <p style={{ margin: '2px 0', fontWeight: 'bold', fontSize: 11 }}>STROY CRM tizimi</p>
                        <p style={{ margin: '2px 0' }}>www.ardentsoft.uz</p>
                        <p style={{ margin: '2px 0' }}>+998 90 557 75 11</p>
                    </div>
                </div>
            </div>
        </>
    )
}
