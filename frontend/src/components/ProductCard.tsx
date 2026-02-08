import { Link } from 'react-router-dom'

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  categoryName?: string | null
  stock: number
  isActive: boolean
}

type ProductCardProps = {
  product: Product
  onAddToCart: (id: string) => void
  loading?: boolean
  added?: boolean
  linkTo?: string
}

export function ProductCard({
  product,
  onAddToCart,
  loading,
  added,
  linkTo,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : isLowStock
      ? `Low stock (${product.stock})`
      : 'In stock'

  const disabled = !product.isActive || isOutOfStock || loading

  return (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-[#232830] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-md">
      {linkTo ? (
        <Link
          to={linkTo}
          className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#f5f6f7]"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
                isOutOfStock ? 'grayscale saturate-0 opacity-85' : ''
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No image
            </div>
          )}
        </Link>
      ) : (
        <div className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#f5f6f7]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
                isOutOfStock ? 'grayscale saturate-0 opacity-85' : ''
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No image
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex-1 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          {product.categoryName ?? 'Uncategorized'}
        </p>
        {linkTo ? (
          <Link to={linkTo} className="inline-block">
            <h3 className="text-lg font-medium text-white">{product.name}</h3>
          </Link>
        ) : (
          <h3 className="text-lg font-medium text-white">{product.name}</h3>
        )}
        {product.description ? (
          <p className="max-h-10 overflow-hidden text-sm leading-5 text-white/65">
            {product.description}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-white">
            ${product.price.toFixed(2)}
          </p>
          {isOutOfStock ? (
            <span className="mt-1 inline-flex rounded-full bg-slate-700/70 px-2 py-1 text-[11px] text-slate-200">
              {stockLabel}
            </span>
          ) : isLowStock ? (
            <span className="mt-1 inline-flex rounded-full bg-amber-500/20 px-2 py-1 text-[11px] text-amber-200">
              {stockLabel}
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {stockLabel}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          disabled={disabled}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            added
              ? 'bg-emerald-500 text-white'
              : 'bg-sky-500 text-white hover:bg-sky-400'
          } disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300`}
        >
          {loading ? (
            <>
              <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.35"
                />
                <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2" />
              </svg>
              Adding...
            </>
          ) : added ? (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1.3" />
                <circle cx="19" cy="21" r="1.3" />
                <path d="M2 3h3l2.2 11h11.1l2-8H7" />
              </svg>
              Add to cart
            </>
          )}
        </button>
      </div>

      {!product.isActive ? (
        <p className="mt-2 text-xs text-slate-400">Inactive product</p>
      ) : null}
    </article>
  )
}
