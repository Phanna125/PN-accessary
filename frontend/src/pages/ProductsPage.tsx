import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api'
import { FiltersBar } from '../components/FiltersBar'
import { ProductCard } from '../components/ProductCard'

type Category = {
  id: string
  name: string
}

type ProductApi = {
  id: string
  title: string
  description?: string | null
  priceCents: number
  stock: number
  imageUrl?: string | null
  isActive?: boolean
  category?: Category | null
}

type ProductView = {
  id: string
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  categoryName?: string | null
  stock: number
  isActive: boolean
}

export function ProductsPage() {
  const [products, setProducts] = useState<ProductApi[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [addedIds, setAddedIds] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (selectedCategory) params.set('categoryId', selectedCategory)
    if (includeInactive) params.set('includeInactive', 'true')
    return params.toString()
  }, [search, selectedCategory, includeInactive])

  const viewProducts: ProductView[] = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.title,
        description: product.description,
        price: product.priceCents / 100,
        imageUrl: product.imageUrl,
        categoryName: product.category?.name ?? null,
        stock: product.stock,
        isActive: product.isActive ?? true,
      })),
    [products],
  )

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    Promise.all([
      apiGet<ProductApi[]>(`/products${query ? `?${query}` : ''}`),
      apiGet<Category[]>(`/categories`),
    ])
      .then(([productsData, categoriesData]) => {
        if (alive) {
          setProducts(productsData)
          setCategories(categoriesData)
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unexpected error')
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [query])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  function clearFilters() {
    setSearch('')
    setSelectedCategory('')
    setIncludeInactive(false)
  }

  async function addToCart(productId: string) {
    setToast(null)
    setAddingId(productId)
    try {
      await apiPost('/cart/items', { productId, quantity: 1 }, true)
      setAddedIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
      setToast({ kind: 'success', message: 'Item added to cart.' })
      window.setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== productId))
      }, 1800)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Please login to add to cart.'
      setToast({ kind: 'error', message })
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f2328] via-[#1b1f25] to-[#171a1f] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 pb-24 sm:px-8 sm:py-10 sm:pb-10 lg:px-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Products
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Explore the catalog, compare items quickly, and add products to cart
            with clear stock visibility.
          </p>
        </header>

        <div className="sticky top-14 z-20 mt-8 sm:top-16">
          <div className="rounded-xl border border-white/10 bg-[#22272f]/95 p-3 backdrop-blur">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className="flex min-h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[#232830] px-4 text-sm font-medium text-white sm:hidden"
            >
              Filters
              <span className="text-xs text-white/60">
                {mobileFiltersOpen ? 'Hide' : 'Show'}
              </span>
            </button>

            <div className={`${mobileFiltersOpen ? 'mt-3 block' : 'hidden'} sm:block`}>
              <FiltersBar
                search={search}
                onSearchChange={setSearch}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                includeInactive={includeInactive}
                onToggleInactive={setIncludeInactive}
                onClear={clearFilters}
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-white/10 bg-[#232830] p-4"
              >
                <div className="aspect-square rounded-lg bg-white/10" />
                <div className="mt-4 h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
                <div className="mt-4 h-10 w-full rounded-lg bg-white/10" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && viewProducts.length === 0 ? (
          <div className="mt-10 rounded-xl border border-white/10 bg-[#232830] p-8 text-center text-white/70">
            No products match your filters.
          </div>
        ) : null}

        {!loading && !error && viewProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {viewProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                loading={addingId === product.id}
                added={addedIds.includes(product.id)}
                linkTo={`/products/${product.id}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <Link
        to="/cart"
        className="fixed bottom-4 left-1/2 z-30 flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-[#22272f]/95 px-5 text-sm font-semibold text-white shadow-lg backdrop-blur sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="21" r="1.2" />
          <circle cx="19" cy="21" r="1.2" />
          <path d="M2 3h3l2.2 11h11.1l2-8H7" />
        </svg>
        Cart
      </Link>

      {toast ? (
        <div
          className={`fixed bottom-20 left-3 right-3 z-40 rounded-xl border px-4 py-3 text-sm shadow-lg sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-xs ${
            toast.kind === 'success'
              ? 'border-emerald-500/30 bg-[#20372e] text-emerald-100'
              : 'border-rose-500/30 bg-[#3b2328] text-rose-100'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{toast.message}</span>
            <Link to="/cart" className="text-xs font-semibold underline underline-offset-2">
              Cart
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
