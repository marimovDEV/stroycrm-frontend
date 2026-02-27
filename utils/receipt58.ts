/**
 * 58mm POS Chek Generator
 * ESC/POS buyruqlari bilan formatlangan chek matnini yaratadi
 * POS58B, GEZHI va boshqa 58mm termal printerlar uchun
 */

function padRight(text: string, length: number): string {
    return text.length >= length
        ? text.slice(0, length)
        : text + " ".repeat(length - text.length)
}

function padLeft(text: string, length: number): string {
    return text.length >= length
        ? text.slice(0, length)
        : " ".repeat(length - text.length) + text
}

function formatMoney(amount: number | string): string {
    return Number(amount).toLocaleString('uz-UZ').replace(/,/g, ' ')
}

export interface ReceiptItem {
    product_name?: string
    name?: string
    quantity: number
    price: number
    total?: number
}

export interface ReceiptOrder {
    seller: string
    customer: string
    date: string
    orderNumber: string | number
    items: ReceiptItem[]
    total: number
    discount?: number
    paymentMethod?: string
    notes?: string
}

export function generateReceipt(order: ReceiptOrder): string {
    const width = 32
    const lines: string[] = []

    // === HEADER ===
    lines.push("\x1B\x40")         // Initialize
    lines.push("\x1B\x61\x01")     // Center align
    lines.push("\x1D\x21\x11")     // Double size
    lines.push("STROY CRM")
    lines.push("\x1D\x21\x00")     // Normal size
    lines.push("")

    // === INFO ===
    lines.push("\x1B\x61\x00")     // Left align
    lines.push("-".repeat(width))
    lines.push(`Sotuvchi : ${order.seller}`)
    lines.push(`Mijoz    : ${order.customer}`)
    lines.push(`Sana     : ${order.date}`)
    lines.push(`Chek №   : ${order.orderNumber}`)
    lines.push("-".repeat(width))

    // === TOVARLAR ===
    order.items.forEach(item => {
        const name = (item.product_name || item.name || '').slice(0, width)
        const qty = item.quantity
        const price = Number(item.price)
        const total = item.total ? Number(item.total) : qty * price

        // Birinchi qator: tovar nomi
        lines.push(` ${name}`)
        // Ikkinchi qator: soni x narxi = summa
        const detail = `  ${qty} x ${formatMoney(price)}`
        const totalStr = formatMoney(total)
        lines.push(padRight(detail, width - totalStr.length) + totalStr)
    })

    lines.push("-".repeat(width))

    // === CHEGIRMA ===
    if (order.discount && Number(order.discount) > 0) {
        const discStr = `-${formatMoney(order.discount)}`
        lines.push(padRight("  Chegirma:", width - discStr.length) + discStr)
    }

    // === TO'LOV TURI ===
    if (order.paymentMethod) {
        const methods: Record<string, string> = { cash: 'Naqd', card: 'Karta', debt: 'Qarz' }
        const methodName = methods[order.paymentMethod] || order.paymentMethod
        lines.push(`  To'lov: ${methodName}`)
    }

    lines.push("=".repeat(width))

    // === JAMI ===
    lines.push("\x1B\x61\x01")     // Center
    lines.push("\x1B\x45\x01")     // Bold ON
    lines.push("\x1D\x21\x01")     // Double Height
    lines.push(`JAMI: ${formatMoney(order.total)} so'm`)
    lines.push("\x1D\x21\x00")     // Normal
    lines.push("\x1B\x45\x00")     // Bold OFF

    // === IZOH ===
    if (order.notes) {
        lines.push("\x1B\x61\x00")   // Left
        lines.push(`Izoh: ${order.notes}`)
    }

    // === FOOTER ===
    lines.push("")
    lines.push("\x1B\x61\x01")     // Center
    lines.push("Xaridingiz uchun rahmat!")
    lines.push("-".repeat(width))
    lines.push("\x1B\x45\x01")     // Bold
    lines.push("Aloqa:")
    lines.push("\x1B\x45\x00")     // Normal
    lines.push("+998 90 078 08 00")
    lines.push("+998 88 856 13 33")
    lines.push("-".repeat(width))
    lines.push("\x1B\x45\x01")
    lines.push("STROY CRM tizimi")
    lines.push("\x1B\x45\x00")
    lines.push("www.ardentsoft.uz")
    lines.push("+998 90 557 75 11")
    lines.push("")
    lines.push("")
    lines.push("")

    // Cut paper
    lines.push("\x1D\x56\x41")

    return lines.join("\n")
}
