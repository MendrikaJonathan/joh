import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUS = {
  pending:'En attente', confirmed:'Confirmé', processing:'En préparation',
  shipped:'Expédié', delivered:'Livré', cancelled:'Annulé', refunded:'Remboursé'
}
const PAYMENT = { pending:'En attente', paid:'Payé ✓', failed:'Échoué', refunded:'Remboursé' }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    supabase.from('orders')
      .select('*, items:order_items(*), address:addresses(*)')
      .eq('id', id).single()
      .then(({ data }) => setOrder(data))
  }, [id])

  if (!order) return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/commandes" className="inline-flex items-center gap-1 text-primary text-sm mb-6 hover:underline">
        <ChevronLeft size={16} /> Mes commandes
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="text-green-500" size={28} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Commande #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
        </div>
        <span className={`ml-auto badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>
          {STATUS[order.status]}
        </span>
      </div>

      <div className="space-y-4">
        {/* Articles */}
        <div className="card p-5">
          <h2 className="section-title">Articles commandés</h2>
          <div className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {item.product_image ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-400">×{item.quantity} × {item.unit_price?.toFixed(2)} €</p>
                </div>
                <span className="font-semibold text-gray-900">{item.total_price?.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="card p-5">
          <h2 className="section-title">Récapitulatif financier</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Sous-total</span><span>{order.subtotal?.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{order.shipping === 0 ? 'Gratuite' : `${order.shipping?.toFixed(2)} €`}</span></div>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total TTC</span><span>{order.total?.toFixed(2)} €</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Paiement : <span className={order.payment_status === 'paid' ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>{PAYMENT[order.payment_status]}</span></p>
        </div>

        {/* Adresse */}
        {order.address && (
          <div className="card p-5">
            <h2 className="section-title">Adresse de livraison</h2>
            <p className="text-gray-700">{order.address.full_name}</p>
            <p className="text-gray-500 text-sm">{order.address.street}</p>
            <p className="text-gray-500 text-sm">{order.address.zip} {order.address.city}, {order.address.country}</p>
            {order.address.phone && <p className="text-gray-500 text-sm">{order.address.phone}</p>}
          </div>
        )}
      </div>

      <Link to="/catalogue" className="btn btn-outline mt-6">Continuer mes achats</Link>
    </div>
  )
}
