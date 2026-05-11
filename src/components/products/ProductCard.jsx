import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function Stars({ rating, count }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13} className={n <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      {count > 0 && <span className="text-gray-400 text-xs">({count})</span>}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const inStock = product.stock > 0
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100) : 0

  return (
    <div className="card-hover flex flex-col group">
      <Link to={`/produit/${product.id}`} className="block relative overflow-hidden rounded-t-2xl aspect-square bg-gray-100">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">📦</div>
        }
        {discount > 0 && <span className="absolute top-2 left-2 badge bg-danger text-white">-{discount}%</span>}
        {!inStock && <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm">Rupture de stock</span>}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-1">
        <p className="text-xs text-gray-400">{product.vendor?.shop_name}</p>
        <Link to={`/produit/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <Stars rating={product.rating} count={product.review_count} />

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-primary-light font-bold text-lg">{product.price.toFixed(2)} €</span>
          {discount > 0 && <span className="text-gray-400 text-sm line-through">{product.compare_price.toFixed(2)} €</span>}
        </div>

        <button
          onClick={() => addToCart(product.id)}
          disabled={!inStock}
          className="btn btn-primary btn-sm mt-auto w-full justify-center"
        >
          <ShoppingCart size={15} />
          {inStock ? 'Ajouter au panier' : 'Indisponible'}
        </button>
      </div>
    </div>
  )
}
