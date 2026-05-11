import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CLS = { published:'badge-green', draft:'badge-orange', archived:'badge-gray' }
const STATUS_LBL = { published:'Publié', draft:'Brouillon', archived:'Archivé' }

export default function VendorProducts() {
  const { vendor } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetch = () => {
    if (!vendor) return
    supabase.from('products').select('*, category:categories(name)').eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }
  useEffect(fetch, [vendor])

  async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produit supprimé')
    fetch()
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'published' ? 'draft' : 'published'
    await supabase.from('products').update({ status: newStatus }).eq('id', product.id)
    toast.success(`Produit ${newStatus === 'published' ? 'publié' : 'mis en brouillon'}`)
    fetch()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Mes Produits ({products.length})</h1>
        <Link to="/vendor/produits/nouveau" className="btn btn-primary"><Plus size={18} /> Nouveau produit</Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={56} className="mx-auto mb-4" />
          <p className="text-lg font-medium">Vous n'avez pas encore de produits</p>
          <Link to="/vendor/produits/nouveau" className="btn btn-primary mt-4">Créer mon premier produit</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  {['Produit','Catégorie','Prix','Stock','Statut','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
                        </div>
                        <span className="font-medium text-gray-800 line-clamp-1 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{p.price?.toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <span className={p.stock === 0 ? 'text-danger font-semibold' : p.stock < 5 ? 'text-orange-500 font-semibold' : 'text-gray-700'}>
                        {p.stock} unités
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(p)} className={`badge cursor-pointer ${STATUS_CLS[p.status]}`}>
                        {STATUS_LBL[p.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/produit/${p.id}`} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100" title="Voir">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/vendor/produits/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Modifier">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
