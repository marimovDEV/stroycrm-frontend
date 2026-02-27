/**
 * QZ Tray Print Utility
 * window.qz global obyektidan foydalanadi (CDN orqali yuklangan)
 * 
 * Talab:
 * 1. QZ Tray dasturini kompyuterga o'rnating: https://qz.io/download/
 * 2. Printerni USB orqali ulang
 * 3. Printer nomini PRINTER_NAME ga yozing
 */

declare const qz: any

// Printer nomi (Windows/Mac da ko'rinadigan nom)
const PRINTER_NAME = "GEZHI_micro_printer"

/**
 * QZ Tray ga ulanib, chek tekstini printerga yuborish
 */
export async function printReceipt(text: string): Promise<boolean> {
    try {
        if (typeof window === 'undefined') return false

        const qzObj = (window as any).qz
        if (!qzObj) {
            console.warn('❌ QZ Tray yuklanmagan. layout.tsx dagi <Script> ni tekshiring.')
            return false
        }

        // Xavfsizlik (self-signed / development muhit)
        qzObj.security.setCertificatePromise((resolve: any) => resolve(''))
        qzObj.security.setSignaturePromise(() => (resolve: any) => resolve(''))

        // Ulanish (agar hali ulanmagan bo'lsa)
        if (!qzObj.websocket.isActive()) {
            await qzObj.websocket.connect()
        }

        // Printer konfiguratsiyasi
        const config = qzObj.configs.create(PRINTER_NAME, {
            encoding: 'ISO-8859-1',
            altPrinting: true,
        })

        // Raw ESC/POS ma'lumot yuborish
        const data = [{
            type: 'raw',
            format: 'plain',
            data: text + '\n\n\n',
        }]

        await qzObj.print(config, data)
        console.log('✅ Chek muvaffaqiyatli chop etildi!')
        return true

    } catch (error: any) {
        console.error('❌ Chop etish xatosi:', error?.message || error)
        return false
    }
}

/**
 * QZ Tray ulanganligini tekshirish
 */
export async function checkPrinterConnection(): Promise<boolean> {
    try {
        if (typeof window === 'undefined') return false
        const qzObj = (window as any).qz
        if (!qzObj) return false

        qzObj.security.setCertificatePromise((resolve: any) => resolve(''))
        qzObj.security.setSignaturePromise(() => (resolve: any) => resolve(''))

        if (!qzObj.websocket.isActive()) {
            await qzObj.websocket.connect()
        }
        return true
    } catch {
        return false
    }
}

/**
 * Mavjud printerlar ro'yxatini olish
 */
export async function listPrinters(): Promise<string[]> {
    try {
        if (typeof window === 'undefined') return []
        const qzObj = (window as any).qz
        if (!qzObj) return []

        if (!qzObj.websocket.isActive()) {
            await qzObj.websocket.connect()
        }
        return await qzObj.printers.find()
    } catch {
        return []
    }
}
