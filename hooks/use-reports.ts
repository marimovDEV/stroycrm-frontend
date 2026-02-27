import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'

export function useReports() {
    const [reports, setReports] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    })

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (dateRange.start_date) params.append('start_date', dateRange.start_date)
            if (dateRange.end_date) params.append('end_date', dateRange.end_date)

            const response = await api.get(`reports/stats/?${params.toString()}`)
            setReports(response.data)
            setError(null)
        } catch (err) {
            console.error('Reports fetch failed:', err)
            setError('Hisobotlarni yuklashda xatolik yuz berdi')
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    return {
        reports,
        loading,
        error,
        dateRange,
        setDateRange,
        refreshReports: fetchReports
    }
}
