import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const STATUS = { pending:'En attente', confirmed:'Confirmé', processing:'En préparation', shipped:'Expédié', delivered:'Livré', cancelled:'Annulé', refunded:'Remboursé' }
const CLS    = { pending:'badge-gray', confirmed:'badge-blue', processing:'badge-orange', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red', refunded:'badge-red' }
const PAYMENT= { pending:'badge-orange', paid:'badge-green', failed:'badge-red', refunded:'badge-gray' }
const PAYMENT_LBL = { pending:'En attente', paid:'Payé ✓', failed:'Échoué', refunded:'Remboursé' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    supabase.from('orders').select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }
  useEffect(fetch, [])

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    toast.success('Statut mis à jour'); fetch()
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="page-title">Toutes les Commandes ({orders.length})</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>{['#Commande','Client','Total','Paiement','Statut','Date','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{o.user?.full_name}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">{o.total?.toFixed(2)} €</td>
                  <td className="px-4 py-3"><span className={`badge ${PAYMENT[o.payment_status] || 'badge-gray'}`}>{PAYMENT_LBL[o.payment_status] || '?'}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${CLS[o.status] || 'badge-gray'}`}>{STATUS[o.status] || o.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
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
    </div>
  )
}
