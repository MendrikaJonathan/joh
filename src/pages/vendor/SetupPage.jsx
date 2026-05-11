import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Store } from 'lucide-react'

export default function VendorSetup() {
  const { user, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ shop_name: '', description: '' })
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('vendors').insert({ ...form, user_id: user.id })
    if (error) toast.error('Erreur : ' + error.message)
    else { toast.success('Boutique créée !'); await fetchProfile(user.id); navigate('/vendor') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Store className="text-accent mx-auto mb-2" size={40} />
          <h1 className="text-white font-bold text-2xl">Créer votre boutique</h1>
          <p className="text-blue-200 mt-1">Configurez votre espace vendeur ShopHub</p>
        </div>
        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Nom de la boutique *</label>
              <input value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                required className="input" placeholder="Ex: TechStore Madagascar" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input" rows={3} placeholder="Décrivez votre boutique..." />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 justify-center">
              {loading ? 'Création...' : '🚀 Lancer ma boutique'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
