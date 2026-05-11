import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, shipping, total, loading } = useCart()
  const navigate = useNavigate()

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Votre panier est vide</h1>
      <p className="text-gray-500 mb-6">Découvrez nos produits et ajoutez vos favoris !</p>
      <Link to="/catalogue" className="btn btn-primary btn-lg">Découvrir les produits</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="page-title">Mon Panier ({items.length} article{items.length > 1 ? 's' : ''})</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Articles */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {item.product?.image_url
                  ? <img src={item.product.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produit/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary text-sm line-clamp-2">{item.product?.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.product?.vendor?.shop_name}</p>
                <p className="text-primary font-bold mt-1">{item.product?.price?.toFixed(2)} €</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-gray-100 font-bold text-sm">−</button>
                <span className="px-3 py-2 font-semibold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-100 font-bold text-sm">+</button>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">{((item.product?.price || 0) * item.quantity).toFixed(2)} €</p>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-danger mt-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="section-title">Résumé</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between"><span>Sous-total</span><span className="font-medium text-gray-900">{subtotal.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Livraison</span><span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>{shipping === 0 ? 'Gratuite 🎉' : `${shipping.toFixed(2)} €`}</span></div>
            {shipping > 0 && <p className="text-xs text-gray-400">Livraison gratuite dès 50 €</p>}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
            <span>Total</span><span>{total.toFixed(2)} €</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn btn-primary w-full py-3 justify-center">
            Commander <ArrowRight size={18} />
          </button>
          <Link to="/catalogue" className="btn btn-ghost w-full justify-center mt-2 text-sm">Continuer mes achats</Link>
        </div>
      </div>
    </div>
  )
}
