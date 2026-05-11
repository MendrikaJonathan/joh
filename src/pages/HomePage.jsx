import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronRight, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/products/ProductCard'

const CATEGORIES = [
  { name:'Électronique', slug:'electronique', icon:'📱', color:'bg-blue-500' },
  { name:'Mode',         slug:'mode',         icon:'👗', color:'bg-pink-500' },
  { name:'Maison',       slug:'maison',       icon:'🏠', color:'bg-green-600' },
  { name:'Livres',       slug:'livres',       icon:'📚', color:'bg-purple-600' },
  { name:'Sport',        slug:'sport',        icon:'⚽', color:'bg-orange-500' },
  { name:'Gaming',       slug:'gaming',       icon:'🎮', color:'bg-indigo-600' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [q, setQ]               = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('products')
      .select('*, vendor:vendors(shop_name)')
      .eq('status', 'published')
      .order('total_sold', { ascending: false })
      .limit(8)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-light text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            La Marketplace <span className="text-accent">Multi-Vendeurs</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8">Des milliers de produits, des centaines de vendeurs — tout en un seul endroit.</p>

          <form onSubmit={e => { e.preventDefault(); if (q.trim()) navigate(`/catalogue?q=${encodeURIComponent(q)}`) }}
            className="flex bg-white rounded-2xl overflow-hidden max-w-xl mx-auto shadow-2xl">
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Que recherchez-vous ?"
              className="flex-1 px-5 py-4 text-gray-800 outline-none text-base" />
            <button type="submit" className="bg-accent hover:bg-accent-light text-white px-6 flex items-center gap-2 font-medium transition-colors">
              <Search size={20} /> Chercher
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/catalogue" className="btn bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">Voir tous les produits</Link>
            <Link to="/register" className="btn bg-accent text-white hover:bg-accent-light">Devenir vendeur →</Link>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Catégories populaires</h2>
          <Link to="/catalogue" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">Voir tout <ChevronRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/catalogue?cat=${cat.slug}`}
              className={`${cat.color} rounded-2xl p-4 text-white text-center hover:scale-105 transition-transform shadow-sm`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Produits vedettes */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-accent" size={24} /> Produits vedettes
          </h2>
          <Link to="/catalogue" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">Voir tout <ChevronRight size={16} /></Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_,i) => <div key={i} className="card aspect-square animate-pulse bg-gray-100" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>Aucun produit disponible pour le moment.</p>
            <Link to="/register" className="btn btn-primary mt-4">Devenir le premier vendeur</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="bg-gradient-to-r from-accent to-orange-500 py-12 px-4 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Vous avez des produits à vendre ?</h2>
        <p className="text-orange-100 mb-6">Rejoignez ShopHub et commencez à vendre aujourd'hui — c'est gratuit !</p>
        <Link to="/register?role=vendor" className="btn bg-white text-accent hover:bg-orange-50 font-semibold px-8 py-3">Créer ma boutique gratuitement</Link>
      </section>
    </div>
  )
}
