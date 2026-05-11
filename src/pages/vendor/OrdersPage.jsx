import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS = { pending:'En attente', confirmed:'Confirmé', processing:'En préparation', shipped:'Expédié', delivered:'Livré', cancelled:'Annulé' }
const CLS    = { pending:'badge-gray', confirmed:'badge-blue', processing:'badge-orange', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }

export default function VendorOrders() {
  const { vendor } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendor) return
    supabase.from('order_items')
      .select('*, order:orders(id, status, created_at, total, user:profiles(full_name, email))')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [vendor])

  async function updateStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) toast.error('Erreur')
    else { toast.success('Statut mis à jour'); setItems(prev => prev.map(i => i.order_id === orderId ? { ...i, order: { ...i.order, status } } : i)) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="page-title">Commandes reçues ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>{['Commande','Client','Produit','Qté','Montant','Statut','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{item.order_id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.order?.user?.full_name}</p>
                      <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.product_image && <img src={item.product_image} className="w-8 h-8 rounded object-cover" alt="" />}
                        <span className="text-gray-700 line-clamp-1 max-w-[160px]">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">×{item.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{item.total_price?.toFixed(2)} €</td>
                    <td className="px-4 py-3"><span className={`badge ${CLS[item.order?.status] || 'badge-gray'}`}>{STATUS[item.order?.status] || '?'}</span></td>
                    <td className="px-4 py-3">
                      <select value={item.order?.status} onChange={e => updateStatus(item.order_id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                        {Object.entries(STATUS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
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
