"use client"

import { useState, useCallback, useEffect } from "react"
import api from "@/lib/api"

export interface Customer {
    id: number
    name: string
    phone: string
    address?: string
    debt: number
}

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await api.get('/customers/')
            setCustomers(response.data.results || response.data)
        } catch (error) {
            console.error("Failed to fetch customers:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    const addCustomer = useCallback(async (data: Omit<Customer, 'id' | 'debt'>) => {
        try {
            const response = await api.post('/customers/', data)
            setCustomers(prev => [...prev, response.data])
            return response.data
        } catch (error) {
            throw error
        }
    }, [])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    return {
        customers,
        loading,
        fetchCustomers,
        addCustomer
    }
}
