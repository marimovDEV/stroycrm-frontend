import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'

export function useDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('dashboard/stats/')
            setStats(response.data)
            setError(null)
        } catch (err) {
            console.error('Dashboard stats fetch failed:', err)
            setError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboardStats()
    }, [fetchDashboardStats])

    return {
        stats,
        loading,
        error,
        refreshStats: fetchDashboardStats
    }
}
