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

  const stockPillClasses = isOutOfStock
    ? 'bg-slate-200 text-slate-600'
    : isLowStock
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700'

  const disabled = !product.isActive || isOutOfStock || loading

  const imageBlock = (
    <div className="relative aspect-square overflow-hidden rounded-[18px] border border-[#e7ebf2] bg-gradient-to-br from-[#f4f6fa] to-[#ebf0f8]">
      <span
        className={`absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${stockPillClasses}`}
      >
        {stockLabel}
      </span>

      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
            isOutOfStock ? 'grayscale saturate-0 opacity-85' : ''
          }`}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          No image
        </div>
      )}
    </div>
  )

  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-[#e4e8ef] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.11)]">
      {linkTo ? (
        <Link to={linkTo} className="block">
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      <div className="mt-4 flex-1 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {product.categoryName ?? 'Uncategorized'}
        </p>

        {linkTo ? (
          <Link to={linkTo} className="inline-block">
            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          </Link>
        ) : (
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        )}

        {product.description ? (
          <p className="max-h-10 overflow-hidden text-sm leading-5 text-slate-500">
            {product.description}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-slate-900">
            ${product.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Stock: {product.stock}</p>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          disabled={disabled}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            added
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-[#ff7a1a] to-[#ff9836] text-white hover:from-[#f97316] hover:to-[#fb923c]'
          } disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500`}
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
              Add
            </>
          )}
        </button>
      </div>

      {!product.isActive ? (
        <p className="mt-2 text-xs text-slate-500">Inactive product</p>
      ) : null}
    </article>
  )
}
