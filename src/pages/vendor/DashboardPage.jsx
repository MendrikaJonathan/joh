import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Package, ShoppingBag, Star, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function KpiCard({ icon: Icon, title, value, sub, color }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`${color} p-3 rounded-xl text-white`}><Icon size={22} /></div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

export default function VendorDashboard() {
  const { vendor } = useAuth()
  const [stats, setStats]   = useState({ revenue: 0, orders: 0, products: 0, rating: 0 })
  const [orders, setOrders] = useState([])
  const [topProds, setTopProds] = useState([])

  useEffect(() => {
    if (!vendor) return
    Promise.all([
      // Revenue & orders from order_items
      supabase.from('order_items').select('total_price, quantity, order_id').eq('vendor_id', vendor.id),
      // Products
      supabase.from('products').select('id, name, total_sold, price, rating, status').eq('vendor_id', vendor.id),
      // Latest orders
      supabase.from('order_items').select('*, order:orders(id, status, created_at, user:profiles(full_name))').eq('vendor_id', vendor.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([{ data: oi }, { data: prods }, { data: latestOI }]) => {
      const revenue = (oi || []).reduce((s, i) => s + i.total_price, 0)
      const orderIds = new Set((oi || []).map(i => i.order_id))
      setStats({
        revenue, orders: orderIds.size,
        products: (prods || []).filter(p => p.status === 'published').length,
        rating: prods?.length ? (prods.reduce((s, p) => s + (p.rating || 0), 0) / prods.length).toFixed(1) : 0
      })
      setTopProds((prods || []).sort((a,b) => b.total_sold - a.total_sold).slice(0, 5))
      setOrders(latestOI || [])
    })
  }, [vendor])

  const STATUS_LABEL = { pending:'En attente', confirmed:'Confirmé', shipped:'Expédié', delivered:'Livré', cancelled:'Annulé' }
  const STATUS_CLS   = { pending:'badge-gray', confirmed:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard — {vendor?.shop_name}</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenue ! Voici votre activité en temps réel.</p>
        </div>
        <Link to="/vendor/produits/nouveau" className="btn btn-primary"><Plus size={18} /> Nouveau produit</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={TrendingUp} title="Chiffre d'affaires" value={`${stats.revenue.toFixed(2)} €`} sub="Total cumulé" color="bg-blue-500" />
        <KpiCard icon={ShoppingBag} title="Commandes" value={stats.orders} sub="Commandes reçues" color="bg-green-600" />
        <KpiCard icon={Package} title="Produits actifs" value={stats.products} sub="Publiés" color="bg-orange-500" />
        <KpiCard icon={Star} title="Note moyenne" value={`${stats.rating}/5`} sub="Sur tous vos produits" color="bg-purple-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Top produits</h2>
            <Link to="/vendor/produits" className="text-primary text-sm hover:underline">Voir tout</Link>
          </div>
          {topProds.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun produit encore.</p>
          ) : (
            <div className="space-y-3">
              {topProds.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold text-sm w-5">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.total_sold} ventes · {p.price?.toFixed(2)} €</p>
                  </div>
                  <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{p.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières commandes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Dernières commandes</h2>
            <Link to="/vendor/commandes" className="text-primary text-sm hover:underline">Voir tout</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map(oi => (
                <div key={oi.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{oi.product_name}</p>
                    <p className="text-xs text-gray-400">{oi.order?.user?.full_name} · ×{oi.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`badge ${STATUS_CLS[oi.order?.status] || 'badge-gray'} mb-1`}>{STATUS_LABEL[oi.order?.status] || '?'}</span>
                    <p className="text-sm font-semibold text-gray-900">{oi.total_price?.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
