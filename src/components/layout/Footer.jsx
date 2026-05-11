import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-blue-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="text-accent" size={22} />
            <span className="text-white font-bold text-lg">ShopHub</span>
          </div>
          <p className="text-sm">Marketplace multi-vendeurs — Achetez, Vendez, Prospérez.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
            <li><Link to="/catalogue" className="hover:text-white transition-colors">Catalogue</Link></li>
            <li><Link to="/panier" className="hover:text-white transition-colors">Panier</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Vendeurs</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-white transition-colors">Devenir vendeur</Link></li>
            <li><Link to="/vendor" className="hover:text-white transition-colors">Mon dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm">support@shophub.mg</p>
          <p className="text-sm mt-1">Antananarivo, Madagascar</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm">
        © {new Date().getFullYear()} ShopHub — Plateforme Multi-Vendeurs
      </div>
    </footer>
  )
}
