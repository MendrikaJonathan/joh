import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/products/ProductCard'

const CATEGORIES = [
  { name:'Toutes', slug:'' },
  { name:'Électronique', slug:'electronique' },
  { name:'Mode', slug:'mode' },
  { name:'Maison', slug:'maison' },
  { name:'Livres', slug:'livres' },
  { name:'Sport', slug:'sport' },
  { name:'Gaming', slug:'gaming' },
]
const SORTS = [
  { label:'Pertinence', value:'total_sold' },
  { label:'Prix ↑', value:'price_asc' },
  { label:'Prix ↓', value:'price_desc' },
  { label:'Nouveautés', value:'created_at' },
  { label:'Meilleures notes', value:'rating' },
]

export default function CataloguePage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [categories, setCategories] = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const q     = params.get('q') || ''
  const cat   = params.get('cat') || ''
  const sort  = params.get('sort') || 'total_sold'
  const minP  = parseInt(params.get('min') || '0')
  const maxP  = parseInt(params.get('max') || '9999')

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products')
      .select('*, vendor:vendors(shop_name), category:categories(name,slug)')
      .eq('status', 'published')
      .gte('price', minP).lte('price', maxP)

    if (q)   query = query.ilike('name', `%${q}%`)
    if (cat) query = query.eq('categories.slug', cat)

    if (sort === 'price_asc')  query = query.order('price', { ascending: true })
    else if (sort === 'price_desc') query = query.order('price', { ascending: false })
    else query = query.order(sort, { ascending: false })

    query.then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [q, cat, sort, minP, maxP])

  const set = (key, val) => setParams(p => { const n = new URLSearchParams(p); val ? n.set(key,val) : n.delete(key); return n })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Résultats pour "${q}"` : cat ? `Catégorie : ${cat}` : 'Tous les produits'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="btn btn-outline btn-sm md:hidden">
          <Filter size={16} /> Filtres
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${showFilter ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <div className="card p-4 sticky top-20 space-y-6">
            {/* Catégorie */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Catégorie</h3>
              <div className="space-y-1">
                {CATEGORIES.map(c => (
                  <button key={c.slug} onClick={() => set('cat', c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${cat === c.slug ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tri */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Trier par</h3>
              <div className="space-y-1">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => set('sort', s.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sort === s.value ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Réinitialiser */}
            {(q || cat || sort !== 'total_sold') && (
              <button onClick={() => setParams({})} className="btn btn-ghost btn-sm w-full text-red-500 justify-center">
                <X size={14} /> Réinitialiser les filtres
              </button>
            )}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_,i) => <div key={i} className="card aspect-square animate-pulse bg-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium">Aucun produit trouvé</p>
              <p className="text-sm mt-1">Essayez d'autres termes de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
