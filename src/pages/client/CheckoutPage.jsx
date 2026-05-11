import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CreditCard, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [addr, setAddr] = useState({ full_name: '', street: '', city: '', zip: '', country: 'Madagascar', phone: '' })
  const [payment, setPayment] = useState('simulation')

  const handleAddr = e => setAddr(a => ({ ...a, [e.target.name]: e.target.value }))

  async function placeOrder(e) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Votre panier est vide'); return }
    setLoading(true)
    try {
      // 1. Sauvegarder l'adresse
      const { data: address } = await supabase.from('addresses')
        .insert({ ...addr, user_id: user.id }).select().single()

      // 2. Créer la commande
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id: user.id,
        address_id: address.id,
        subtotal, shipping, discount: 0, total,
        status: 'confirmed',
        payment_status: payment === 'simulation' ? 'paid' : 'pending',
        payment_method: payment,
      }).select().single()
      if (orderErr) throw orderErr

      // 3. Créer les lignes de commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        vendor_id: item.product.vendor_id || '',
        product_name: item.product.name,
        product_image: item.product.image_url,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))
      await supabase.from('order_items').insert(orderItems)

      // 4. Vider le panier
      await clearCart()

      toast.success('Commande passée avec succès !')
      navigate(`/commandes/${order.id}`)
    } catch (err) {
      toast.error('Erreur lors de la commande : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/panier')
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="page-title">Finaliser la commande</h1>

      <form onSubmit={placeOrder}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gauche : formulaire */}
          <div className="space-y-4">
            {/* Adresse */}
            <div className="card p-6">
              <h2 className="section-title">Adresse de livraison</h2>
              <div className="space-y-3">
                {[['full_name','Nom complet','Marie Dupont'],['street','Rue et numéro','12 rue de la Paix'],
                  ['city','Ville','Antananarivo'],['zip','Code postal','101'],
                  ['country','Pays','Madagascar'],['phone','Téléphone','+261 34 00 000 00']].map(([name,label,ph]) => (
                  <div key={name}>
                    <label className="label">{label}</label>
                    <input name={name} value={addr[name]} onChange={handleAddr} required
                      placeholder={ph} className="input" />
                  </div>
                ))}
              </div>
            </div>

            {/* Paiement */}
            <div className="card p-6">
              <h2 className="section-title flex items-center gap-2"><Lock size={18} /> Mode de paiement</h2>
              <div className="space-y-3">
                {[
                  { val:'simulation', label:'💳 Simulation (démo)', desc:'Paiement simulé — commande immédiatement confirmée' },
                  { val:'stripe', label:'💳 Stripe', desc:'Paiement sécurisé par carte bancaire' },
                  { val:'mobile_money', label:'📱 Mobile Money', desc:'MVola, Orange Money, Airtel Money' },
                ].map(({ val, label, desc }) => (
                  <label key={val} className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${payment === val ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} className="mt-1" />
                    <div>
                      <div className="font-medium text-sm text-gray-800">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Droite : récapitulatif */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="section-title">Récapitulatif</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.product?.image_url
                        ? <img src={item.product.image_url} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{((item.product?.price || 0) * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <hr className="mb-4" />
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
                <div className="flex justify-between"><span>Livraison</span><span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}</span></div>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
                <span>Total</span><span>{total.toFixed(2)} €</span>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 justify-center text-base">
                <CheckCircle size={20} />
                {loading ? 'Traitement...' : `Confirmer la commande — ${total.toFixed(2)} €`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} /> Paiement 100% sécurisé
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
