import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

const ROLE_CLS = { admin:'badge-red', vendor:'badge-blue', client:'badge-green' }

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [q, setQ]           = useState('')
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }
  useEffect(fetch, [])

  async function updateRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    toast.success('Rôle mis à jour')
    fetch()
  }

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="page-title">Gestion des Utilisateurs ({users.length})</h1>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher par nom ou email..." className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>{['Utilisateur','Email','Rôle','Inscrit le','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {u.full_name?.[0] || '?'}
                      </div>
                      <span className="font-medium text-gray-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`badge ${ROLE_CLS[u.role]}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                      <option value="client">client</option>
                      <option value="vendor">vendor</option>
                      <option value="admin">admin</option>
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
