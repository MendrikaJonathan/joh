import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { profile, fetchProfile, user } = useAuth()
  const [form, setForm] = useState({ full_name: profile?.full_name || '' })
  const [loading, setLoading] = useState(false)

  async function save(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    if (error) toast.error('Erreur lors de la mise à jour')
    else { toast.success('Profil mis à jour !'); fetchProfile(user.id) }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="page-title">Mon Profil</h1>
      <div className="card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {profile?.full_name?.[0] || <User size={28} />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{profile?.full_name}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className={`badge mt-1 ${profile?.role === 'admin' ? 'badge-red' : profile?.role === 'vendor' ? 'badge-blue' : 'badge-green'}`}>
              {profile?.role === 'admin' ? '⚙️ Administrateur' : profile?.role === 'vendor' ? '🏪 Vendeur' : '👤 Client'}
            </span>
          </div>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={profile?.email} disabled />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </form>
      </div>
    </div>
  )
}
