"use client"

import { useState, useCallback, useEffect } from "react"
import type { Product } from "@/lib/types"
import api from "@/lib/api"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('products/');

      // Map Django snake_case to frontend camelCase
      // Django model: cost_price, sale_price, min_stock, stock
      // Frontend type: buyPrice, sellPrice, minStock, currentStock
      const mappedProducts: Product[] = response.data.results.map((p: any) => ({
        id: p.id,
        barcode: p.short_code, // Or handle multiple barcodes logic
        name: p.name,
        category: p.category,
        unit: p.sell_unit,
        buyPrice: Number(p.cost_price),
        sellPrice: Number(p.sale_price),
        minStock: Number(p.min_stock),
        currentStock: Number(p.stock),
        createdAt: p.created_at,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.delete(`products/${id}/`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }, []);

  const addProduct = useCallback(async (productData: any) => {
    try {
      const payload = {
        name: productData.name,
        category: productData.category,
        sale_price: productData.sellPrice,
        cost_price: productData.buyPrice,
        min_stock: productData.minStock,
        stock: productData.currentStock,
        sell_unit: productData.unit,
        base_unit: productData.unit, // Default to same for now
        unit_ratio: 1,
      };
      const response = await api.post('products/', payload);
      setProducts(prev => [response.data].concat(prev));
      return response.data;
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, partialData: Partial<Product>) => {
    try {
      // Map frontend camelCase back to snake_case for Django
      const payload: any = {};
      if (partialData.name !== undefined) payload.name = partialData.name;
      if (partialData.category !== undefined) payload.category = partialData.category;
      if (partialData.sellPrice !== undefined) payload.sale_price = partialData.sellPrice;
      if (partialData.buyPrice !== undefined) payload.cost_price = partialData.buyPrice;
      if (partialData.minStock !== undefined) payload.min_stock = partialData.minStock;
      if (partialData.currentStock !== undefined) payload.stock = partialData.currentStock;
      if (partialData.unit !== undefined) payload.sell_unit = partialData.unit;

      await api.patch(`products/${id}/`, payload);

      // Update local state
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, ...partialData };
        }
        return p;
      }));
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  }, [])

  const getProductByBarcode = useCallback((barcode: string) => products.find((p) => p.barcode === barcode), [products])

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    avgMargin: 0
  })

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('products/stats/')
      setStats(response.data)
    } catch (e) {
      console.error("Failed to fetch stats", e)
    }
  }, [])

  // Category Management
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('categories/')
      setCategories(response.data.results || response.data)
    } catch (e) {
      console.error("Failed to fetch categories", e)
    }
  }, [])

  const addCategory = useCallback(async (name: string) => {
    try {
      const response = await api.post('categories/', { name })
      setCategories(prev => [...prev, response.data])
      return response.data
    } catch (e) {
      console.error("Failed to add category", e)
      throw e
    }
  }, [])

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchCategories();
  }, [fetchProducts, fetchStats, fetchCategories]);

  return {
    products,
    loading,
    stats,
    categories,
    addCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    refreshProducts: () => { fetchProducts(); fetchStats(); fetchCategories(); }
  }
}
