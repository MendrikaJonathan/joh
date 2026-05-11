import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, LogOut, LayoutDashboard, Package, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, profile, isVendor, isAdmin, signOut } = useAuth()
  const { itemsCount } = useCart()
  const navigate = useNavigate()
  const [q, setQ]           = useState('')
  const [menuOpen, setMenu] = useState(false)
  const [dropOpen, setDrop] = useState(false)

  const handleSearch = e => {
    e.preventDefault()
    if (q.trim()) navigate(`/catalogue?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <ShoppingBag className="text-accent" size={28} />
          <span className="text-white font-bold text-xl">ShopHub</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="flex w-full bg-white rounded-xl overflow-hidden">
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un produit..."
              className="flex-1 px-4 py-2 text-sm outline-none text-gray-800"
            />
            <button type="submit" className="px-4 bg-accent text-white hover:bg-accent-light transition-colors">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Link to="/catalogue" className="text-blue-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm transition-colors">Produits</Link>

          {/* Cart */}
          <Link to="/panier" className="relative text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ShoppingCart size={22} />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{itemsCount}</span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setDrop(!dropOpen)} className="flex items-center gap-2 text-blue-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <User size={18} />
                <span className="text-sm">{profile?.full_name?.split(' ')[0]}</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50" onMouseLeave={() => setDrop(false)}>
                  <Link to="/profil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDrop(false)}>
                    <User size={15} /> Mon profil
                  </Link>
                  <Link to="/commandes" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDrop(false)}>
                    <Package size={15} /> Mes commandes
                  </Link>
                  {isVendor && (
                    <Link to="/vendor" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDrop(false)}>
                      <LayoutDashboard size={15} /> Dashboard vendeur
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDrop(false)}>
                      <LayoutDashboard size={15} /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={() => { signOut(); setDrop(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50">
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-accent btn-sm ml-1">Connexion</Link>
          )}
        </div>

        {/* Mobile menu btn */}
        <button onClick={() => setMenu(!menuOpen)} className="md:hidden ml-auto text-white p-2">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 px-4 py-3 flex flex-col gap-2">
          <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden mb-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..." className="flex-1 px-3 py-2 text-sm outline-none text-gray-800" />
            <button type="submit" className="px-3 bg-accent text-white"><Search size={16} /></button>
          </form>
          <Link to="/catalogue" className="text-blue-200 py-2 text-sm" onClick={() => setMenu(false)}>Produits</Link>
          <Link to="/panier"    className="text-blue-200 py-2 text-sm" onClick={() => setMenu(false)}>Panier ({itemsCount})</Link>
          {user ? (
            <>
              <Link to="/commandes" className="text-blue-200 py-2 text-sm" onClick={() => setMenu(false)}>Mes commandes</Link>
              {isVendor && <Link to="/vendor" className="text-blue-200 py-2 text-sm" onClick={() => setMenu(false)}>Dashboard vendeur</Link>}
              {isAdmin  && <Link to="/admin"  className="text-blue-200 py-2 text-sm" onClick={() => setMenu(false)}>Admin</Link>}
              <button onClick={() => { signOut(); setMenu(false) }} className="text-red-300 py-2 text-sm text-left">Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="text-white font-medium py-2 text-sm" onClick={() => setMenu(false)}>Connexion</Link>
          )}
        </div>
      )}
    </nav>
  )
}
