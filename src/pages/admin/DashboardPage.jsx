import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function KpiCard({ icon: Icon, title, value, sub, color, to }) {
  const inner = (
    <div className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} p-3 rounded-xl text-white shrink-0`}><Icon size={22} /></div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, vendors: 0, products: 0, orders: 0, revenue: 0 })
  const [recentUsers, setRecentUsers]   = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vendors').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('orders').select('id, total', { count: 'exact' }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('*, user:profiles(full_name)').order('created_at', { ascending: false }).limit(8),
    ]).then(([{ count: u }, { count: v }, { count: p }, { data: orders, count: o }, { data: users }, { data: recentO }]) => {
      const revenue = (orders || []).reduce((s, o) => s + (o.total || 0), 0)
      setStats({ users: u || 0, vendors: v || 0, products: p || 0, orders: o || 0, revenue })
      setRecentUsers(users || [])
      setRecentOrders(recentO || [])
    })
  }, [])

  const STATUS_CLS = { pending:'badge-gray', confirmed:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }
  const STATUS_LBL = { pending:'En attente', confirmed:'Confirmé', delivered:'Livré', cancelled:'Annulé' }
  const ROLE_CLS   = { admin:'badge-red', vendor:'badge-blue', client:'badge-green' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Administration</h1>
      <p className="text-gray-500 text-sm mb-8">Vue globale de la plateforme ShopHub</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={Users}      title="Utilisateurs"    value={stats.users}    sub="Inscrits"       color="bg-blue-500"   to="/admin/users" />
        <KpiCard icon={Package}    title="Vendeurs"        value={stats.vendors}  sub="Boutiques actives" color="bg-green-600" to="/admin/users" />
        <KpiCard icon={ShoppingBag}title="Produits publiés" value={stats.products} sub="En ligne"       color="bg-purple-600" to="/admin/produits" />
        <KpiCard icon={TrendingUp} title="Revenus totaux"  value={`${stats.revenue.toFixed(0)} €`} sub={`${stats.orders} commandes`} color="bg-orange-500" to="/admin/commandes" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Utilisateurs récents */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">Utilisateurs récents</h2>
            <Link to="/admin/users" className="text-primary text-sm hover:underline">Gérer →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {u.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`badge ${ROLE_CLS[u.role] || 'badge-gray'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title mb-0">Commandes récentes</h2>
            <Link to="/admin/commandes" className="text-primary text-sm hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{o.user?.full_name} · {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`badge ${STATUS_CLS[o.status] || 'badge-gray'}`}>{STATUS_LBL[o.status] || o.status}</span>
                <span className="font-semibold text-gray-900 text-sm">{o.total?.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
