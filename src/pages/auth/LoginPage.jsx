import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form)
      toast.success('Connexion réussie !')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Identifiants incorrects')
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
          <p className="text-blue-200">Connectez-vous à votre compte</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required className="input" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                required className="input" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Créer un compte</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 card p-4 text-sm">
          <p className="font-semibold text-gray-700 mb-2">Comptes de démonstration :</p>
          <div className="space-y-1 text-gray-500">
            <p>👤 Client : client@demo.com / demo1234</p>
            <p>🏪 Vendeur : vendeur@demo.com / demo1234</p>
            <p>⚙️ Admin : admin@demo.com / demo1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
