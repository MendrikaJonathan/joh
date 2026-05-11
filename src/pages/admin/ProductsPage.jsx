import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Search, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_CLS = { published:'badge-green', draft:'badge-orange', archived:'badge-gray' }
const STATUS_LBL = { published:'Publié', draft:'Brouillon', archived:'Archivé' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    supabase.from('products').select('*, vendor:vendors(shop_name), category:categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }
  useEffect(fetch, [])

  async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Supprimé'); fetch()
  }

  async function toggleStatus(p) {
    const status = p.status === 'published' ? 'archived' : 'published'
    await supabase.from('products').update({ status }).eq('id', p.id)
    toast.success('Statut mis à jour'); fetch()
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(q.toLowerCase()) || p.vendor?.shop_name?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="page-title">Tous les Produits ({products.length})</h1>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..." className="input pl-9" />
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>{['Produit','Vendeur','Catégorie','Prix','Stock','Statut','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
                      </div>
                      <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.vendor?.shop_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{p.price?.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} className={`badge cursor-pointer ${STATUS_CLS[p.status]}`}>{STATUS_LBL[p.status]}</button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/produit/${p.id}`} className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-100"><Eye size={15} /></Link>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-danger rounded hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
