import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchCart()
    else setItems([])
  }, [user])

  async function fetchCart() {
    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select(`*, product:products(id, name, price, image_url, stock, vendor:vendors(shop_name))`)
      .eq('user_id', user.id)
    setItems(data || [])
    setLoading(false)
  }

  async function addToCart(productId, quantity = 1) {
    if (!user) { toast.error('Connectez-vous pour ajouter au panier'); return }
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: user.id, product_id: productId, quantity },
      { onConflict: 'user_id,product_id', ignoreDuplicates: false }
    )
    if (error) toast.error('Erreur lors de l\'ajout')
    else { toast.success('Ajouté au panier !'); fetchCart() }
  }

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return removeItem(itemId)
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    fetchCart()
  }

  async function removeItem(itemId) {
    await supabase.from('cart_items').delete().eq('id', itemId)
    fetchCart()
  }

  async function clearCart() {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }

  const subtotal   = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
  const itemsCount = items.reduce((s, i) => s + i.quantity, 0)
  const shipping   = subtotal >= 50 ? 0 : 5
  const total      = subtotal + shipping

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, subtotal, shipping, total, itemsCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
