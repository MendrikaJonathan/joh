import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'client' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Mot de passe trop court (min 6 caractères)'); return }
    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, role: form.role })
      toast.success('Compte créé ! Vérifiez votre email.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <ShoppingBag className="text-accent" size={32} />
            <span className="text-white font-bold text-2xl">ShopHub</span>
          </div>
          <p className="text-blue-200">Créez votre compte gratuitement</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Nom complet</label>
              <input name="fullName" value={form.fullName} onChange={handle}
                required className="input" placeholder="Marie Dupont" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required className="input" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                required className="input" placeholder="Min. 6 caractères" />
            </div>

            <div>
              <label className="label">Je suis un :</label>
              <div className="grid grid-cols-2 gap-3">
                {[['client','👤 Client','Acheter des produits'],['vendor','🏪 Vendeur','Vendre mes produits']].map(([val, label, sub]) => (
                  <label key={val} className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${form.role === val ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="role" value={val} checked={form.role === val} onChange={handle} className="sr-only" />
                    <div className="font-medium text-sm text-gray-800">{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
