import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Zap, Package, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Stars({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} className={n <= Math.round(rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
      ))}
    </div>
  )
}

export default function ProductPage() {
  const { id }         = useParams()
  const { addToCart }  = useCart()
  const { user }       = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty]         = useState(1)
  const [imgIdx, setImgIdx]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [review, setReview]   = useState({ rating: 5, comment: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, vendor:vendors(*), category:categories(name)').eq('id', id).single(),
      supabase.from('reviews').select('*, user:profiles(full_name)').eq('product_id', id).order('created_at', { ascending: false })
    ]).then(([{ data: p }, { data: r }]) => {
      setProduct(p); setReviews(r || []); setLoading(false)
    })
  }, [id])

  async function submitReview(e) {
    e.preventDefault()
    const { error } = await supabase.from('reviews').upsert({ user_id: user.id, product_id: id, ...review })
    if (error) toast.error('Erreur lors de l\'envoi')
    else { toast.success('Avis publié !'); setReview({ rating: 5, comment: '' }) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
  if (!product) return <div className="text-center py-20 text-gray-400">Produit introuvable.</div>

  const images = [product.image_url, ...(product.images || [])].filter(Boolean)
  const inStock = product.stock > 0
  const discount = product.compare_price > product.price ? Math.round((1 - product.price / product.compare_price) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/catalogue" className="inline-flex items-center gap-1 text-primary text-sm mb-6 hover:underline">
        <ChevronLeft size={16} /> Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mb-3">
            {images[imgIdx]
              ? <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary' : 'border-gray-200'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{product.category?.name} · Vendu par <span className="text-primary font-medium">{product.vendor?.shop_name}</span></p>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-gray-500 text-sm">{product.review_count} avis</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{product.total_sold} vendus</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{product.price.toFixed(2)} €</span>
            {discount > 0 && <>
              <span className="text-gray-400 text-lg line-through">{product.compare_price.toFixed(2)} €</span>
              <span className="badge badge-red">-{discount}%</span>
            </>}
          </div>

          <div className={`flex items-center gap-2 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <Package size={16} />
            {inStock ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* Quantité */}
          {inStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantité :</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-gray-100 font-bold">−</button>
                <span className="px-4 py-2 font-semibold min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-gray-100 font-bold">+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => addToCart(product.id, qty)} disabled={!inStock}
              className="btn btn-primary flex-1 py-3 justify-center">
              <ShoppingCart size={18} /> Ajouter au panier
            </button>
            <button onClick={() => { addToCart(product.id, qty); window.location.href = '/checkout' }}
              disabled={!inStock} className="btn btn-accent flex-1 py-3 justify-center">
              <Zap size={18} /> Acheter maintenant
            </button>
          </div>
        </div>
      </div>

      {/* Avis */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Avis clients ({reviews.length})</h2>

        {user && (
          <form onSubmit={submitReview} className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Laisser un avis</h3>
            <div className="flex items-center gap-2 mb-3">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setReview(r => ({ ...r, rating: n }))}>
                  <Star size={24} className={n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                </button>
              ))}
            </div>
            <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
              className="input" rows={3} placeholder="Partagez votre expérience..." />
            <button type="submit" className="btn btn-primary mt-3">Publier l'avis</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucun avis pour ce produit.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {r.user?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.user?.full_name || 'Anonyme'}</p>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
