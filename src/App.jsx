import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Layout
import Navbar     from './components/layout/Navbar'
import Footer     from './components/layout/Footer'

// Public pages
import HomePage        from './pages/HomePage'
import CataloguePage   from './pages/CataloguePage'
import ProductPage     from './pages/ProductPage'
import LoginPage       from './pages/auth/LoginPage'
import RegisterPage    from './pages/auth/RegisterPage'

// Client pages
import CartPage        from './pages/client/CartPage'
import CheckoutPage    from './pages/client/CheckoutPage'
import OrdersPage      from './pages/client/OrdersPage'
import OrderDetailPage from './pages/client/OrderDetailPage'
import ProfilePage     from './pages/client/ProfilePage'

// Vendor pages
import VendorDashboard from './pages/vendor/DashboardPage'
import VendorProducts  from './pages/vendor/ProductsPage'
import ProductForm     from './pages/vendor/ProductFormPage'
import VendorOrders    from './pages/vendor/OrdersPage'
import VendorSetup     from './pages/vendor/SetupPage'

// Admin pages
import AdminDashboard  from './pages/admin/DashboardPage'
import AdminUsers      from './pages/admin/UsersPage'
import AdminProducts   from './pages/admin/ProductsPage'
import AdminOrders     from './pages/admin/OrdersPage'

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/catalogue"   element={<CataloguePage />} />
          <Route path="/produit/:id" element={<ProductPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />

          {/* Client */}
          <Route path="/panier"    element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/commandes/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/profil"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Vendor */}
          <Route path="/vendor/setup"     element={<ProtectedRoute roles={['vendor']}><VendorSetup /></ProtectedRoute>} />
          <Route path="/vendor"           element={<ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/produits"  element={<ProtectedRoute roles={['vendor']}><VendorProducts /></ProtectedRoute>} />
          <Route path="/vendor/produits/nouveau" element={<ProtectedRoute roles={['vendor']}><ProductForm /></ProtectedRoute>} />
          <Route path="/vendor/produits/:id"     element={<ProtectedRoute roles={['vendor']}><ProductForm /></ProtectedRoute>} />
          <Route path="/vendor/commandes" element={<ProtectedRoute roles={['vendor']}><VendorOrders /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"    element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/produits" element={<ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/commandes"element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
