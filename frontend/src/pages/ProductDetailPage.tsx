import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api'

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  title: string
  description?: string | null
  priceCents: number
  stock: number
  imageUrl?: string | null
  category?: Category | null
}

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartMessage, setCartMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    apiGet<Product>(`/products/${id}`)
      .then((data) => setProduct(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load product'),
      )
      .finally(() => setLoading(false))
  }, [id])

  async function addToCart() {
    if (!product) return
    setCartMessage(null)
    try {
      await apiPost('/cart/items', { productId: product.id, quantity: 1 }, true)
      setCartMessage('Added to cart!')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Please login to add to cart.'
      setCartMessage(message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 text-white">
      <Link to="/" className="text-sm text-white/60 hover:text-white">
        ← Back to products
      </Link>

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-8 text-white/70">
          Loading product...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-500/20 p-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && product ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl bg-white/10">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-white/40">
                No image
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white/10 p-8 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              {product.category?.name ?? 'Uncategorized'}
            </p>
            <h1 className="mt-3 text-3xl font-bold">{product.title}</h1>
            {product.description ? (
              <p className="mt-4 text-white/70">{product.description}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold">
                  ${(product.priceCents / 100).toFixed(2)}
                </p>
                <p className="text-sm text-white/60">
                  Stock: {product.stock}
                </p>
              </div>
              <button
                type="button"
                onClick={addToCart}
                className="rounded-full bg-mint px-5 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
              >
                Add to cart
              </button>
            </div>

            {cartMessage ? (
              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/70">
                {cartMessage}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
