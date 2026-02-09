import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost } from '../lib/api'
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

type HighlightTone = 'blue' | 'cream' | 'rose' | 'mint'

type HighlightCard = {
  id: string
  label: string
  imageUrl?: string | null
  badge: string
  tone: HighlightTone
  categoryId: string
}

const highlightTones: HighlightTone[] = ['blue', 'cream', 'rose', 'mint']

function highlightToneClasses(tone: HighlightTone) {
  if (tone === 'blue') return 'bg-[#e8eef9]'
  if (tone === 'cream') return 'bg-[#f8f2eb]'
  if (tone === 'rose') return 'bg-[#f8ecef]'
  return 'bg-[#e9f4ef]'
}

function promoToneClasses(index: number) {
  return index % 2 === 0
    ? 'bg-gradient-to-br from-[#fff2e8] via-[#fdeede] to-[#eaf2fb]'
    : 'bg-gradient-to-br from-[#ebf3ff] via-[#eef6ff] to-[#fdf1e8]'
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

  const hasFilters =
    search.trim().length > 0 ||
    selectedCategory.length > 0 ||
    includeInactive

  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name ??
    'All categories'

  const heroProduct = useMemo(() => {
    const featuredWithImage = viewProducts.find(
      (product) => product.isActive && product.imageUrl,
    )
    if (featuredWithImage) return featuredWithImage

    const featuredActive = viewProducts.find((product) => product.isActive)
    if (featuredActive) return featuredActive

    return viewProducts[0] ?? null
  }, [viewProducts])

  const promoProducts = useMemo(
    () =>
      viewProducts
        .filter((product) => product.id !== heroProduct?.id)
        .slice(0, 2),
    [heroProduct?.id, viewProducts],
  )

  const categoryHighlights = useMemo<HighlightCard[]>(() => {
    const cards = categories.slice(0, 4).map((category, index) => {
      const categoryProduct =
        viewProducts.find(
          (product) =>
            product.categoryName === category.name && product.imageUrl,
        ) ??
        viewProducts.find(
          (product) => product.categoryName === category.name,
        )

      const badge =
        index === 0
          ? '-30%'
          : index === 1
            ? 'New'
            : `${Math.max(8, Math.min(32, categoryProduct?.stock ?? 12))}+`

      return {
        id: category.id,
        label: category.name,
        imageUrl: categoryProduct?.imageUrl,
        badge,
        tone: highlightTones[index % highlightTones.length],
        categoryId: category.id,
      }
    })

    if (cards.length > 0) return cards

    return viewProducts.slice(0, 4).map((product, index) => ({
      id: `fallback-${product.id}`,
      label: product.categoryName ?? product.name,
      imageUrl: product.imageUrl,
      badge: index === 0 ? 'Top' : 'Fresh',
      tone: highlightTones[index % highlightTones.length],
      categoryId: '',
    }))
  }, [categories, viewProducts])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    Promise.all([
      apiGet<ProductApi[]>(`/products${query ? `?${query}` : ''}`),
      apiGet<Category[]>('/categories'),
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
    const timer = window.setTimeout(() => setToast(null), 2600)
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
      setAddedIds((prev) =>
        prev.includes(productId) ? prev : [...prev, productId],
      )
      setToast({ kind: 'success', message: 'Item added to your cart.' })
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_18%,#f3f7fc_0%,#e8edf5_36%,#dde4ef_100%)] px-3 py-6 sm:px-6 sm:py-9">
      <div className="pn-panel-enter relative mx-auto w-full max-w-[1220px] overflow-hidden rounded-[34px] border border-white/80 bg-[#f9fafb]/95 p-4 shadow-[0_28px_90px_rgba(17,24,39,0.16)] backdrop-blur sm:p-6 lg:p-7">
        <span className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[#ffd6b8]/45 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-[#dbe9fb]/60 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
          <aside className="rounded-[26px] bg-white/70 p-4 shadow-[0_12px_40px_rgba(17,24,39,0.06)] sm:p-5">
            <div className="flex items-center gap-3">
              <img
                src="/pn-logo-mark.svg"
                alt="PN-Accessory logo"
                className="h-12 w-12 rounded-2xl object-cover shadow-[0_8px_16px_rgba(32,41,56,0.35)]"
              />

              <div>
                <p className="font-display text-[2rem] leading-none text-slate-900">
                  PN-Accessory
                </p>
                <p className="text-xs text-slate-500">Modern everyday picks</p>
              </div>
            </div>

            <div className="mt-7">
              <p className="font-display text-[2rem] leading-none text-slate-900">
                Categories
              </p>

              <div className="mt-4 grid gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`stagger-fade rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    selectedCategory === ''
                      ? 'bg-[#1f2937] text-white shadow-[0_10px_24px_rgba(31,41,55,0.26)]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  All products
                </button>

                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    style={{ animationDelay: `${80 + index * 45}ms` }}
                    className={`stagger-fade rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                      selectedCategory === category.id
                        ? 'bg-[#1f2937] text-white shadow-[0_10px_24px_rgba(31,41,55,0.26)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[24px] bg-white/70 p-3 shadow-[0_10px_36px_rgba(17,24,39,0.06)] sm:p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3" />
                    </svg>
                  </span>

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products"
                    className="h-11 w-full rounded-full border border-[#e0e6ef] bg-[#f3f5f8] px-4 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#f97316] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className="h-11 rounded-full border border-[#e0e6ef] bg-[#f3f5f8] px-4 pr-10 text-sm text-slate-700 focus:border-[#f97316] focus:outline-none"
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <path d="M6 8l4 4 4-4" />
                      </svg>
                    </span>
                  </div>

                  <label className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e0e6ef] bg-[#f3f5f8] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <input
                      type="checkbox"
                      checked={includeInactive}
                      onChange={(event) =>
                        setIncludeInactive(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#f97316] focus:ring-[#f97316]/30"
                    />
                    Inactive
                  </label>

                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="h-11 rounded-full px-3 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to="/cart"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e6ef] bg-[#f7f8fa] text-slate-600 transition hover:border-[#f97316]/40 hover:text-[#f97316]"
                    aria-label="Cart"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <circle cx="9" cy="21" r="1.2" />
                      <circle cx="19" cy="21" r="1.2" />
                      <path d="M2 3h3l2.2 11h11.1l2-8H7" />
                    </svg>
                  </Link>

                  <Link
                    to="/orders"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e6ef] bg-[#f7f8fa] text-slate-600 transition hover:border-[#f97316]/40 hover:text-[#f97316]"
                    aria-label="Orders"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M6 3h12v18l-6-3-6 3z" />
                    </svg>
                  </Link>

                  <img
                    src="/pn-logo-mark.svg"
                    alt="PN-Accessory mark"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
              <article className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#edf1f7] via-[#fbf4ee] to-[#e9f0fb] p-6 sm:p-8">
                <div className="max-w-[320px]">
                  <p className="font-display text-[3.2rem] leading-[0.88] text-slate-900 sm:text-[3.9rem]">
                    BIG SALE!
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {heroProduct?.description?.trim()
                      ? heroProduct.description
                      : 'Wireless headphones and daily essentials with sharp prices and clean design.'}
                  </p>

                  {heroProduct ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        to={`/products/${heroProduct.id}`}
                        className="rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#ff9836] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5"
                      >
                        Shop now
                      </Link>

                      <button
                        type="button"
                        onClick={() => addToCart(heroProduct.id)}
                        className="rounded-full border border-slate-300 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#f97316]/40 hover:text-[#f97316]"
                      >
                        Add to cart
                      </button>
                    </div>
                  ) : null}
                </div>

                {heroProduct?.imageUrl ? (
                  <img
                    src={heroProduct.imageUrl}
                    alt={heroProduct.name}
                    className="pointer-events-none absolute bottom-0 right-2 h-[78%] w-[48%] max-w-[260px] object-contain drop-shadow-[0_22px_30px_rgba(15,23,42,0.2)]"
                  />
                ) : (
                  <div className="pointer-events-none absolute bottom-5 right-7 grid h-36 w-36 place-items-center rounded-full bg-white/70 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Featured
                  </div>
                )}
              </article>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {promoProducts.length > 0 ? (
                  promoProducts.map((product, index) => (
                    <article
                      key={product.id}
                      className={`relative overflow-hidden rounded-[22px] p-5 ${promoToneClasses(index)}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {index === 0 ? 'Get up to 20%' : 'Spotlight pick'}
                      </p>
                      <h3 className="mt-2 max-w-[190px] text-xl font-semibold text-slate-900">
                        {product.name}
                      </h3>
                      <Link
                        to={`/products/${product.id}`}
                        className="mt-4 inline-flex rounded-full bg-[#111827] px-4 py-1.5 text-xs font-semibold text-white"
                      >
                        Shop now
                      </Link>

                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="pointer-events-none absolute bottom-2 right-2 h-24 w-24 object-contain drop-shadow-[0_10px_16px_rgba(15,23,42,0.2)]"
                        />
                      ) : null}
                    </article>
                  ))
                ) : (
                  <article className="rounded-[22px] bg-gradient-to-br from-[#eef3fa] to-[#f8eee6] p-5 text-sm text-slate-500">
                    Add more products to unlock promo cards.
                  </article>
                )}
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-[2.5rem] leading-none text-slate-900 sm:text-[2.9rem]">
                  Explore Popular Categories
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  See all -&gt;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {categoryHighlights.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    style={{ animationDelay: `${120 + index * 60}ms` }}
                    onClick={() => {
                      if (card.categoryId) {
                        setSelectedCategory(card.categoryId)
                        return
                      }
                      setSearch(card.label)
                    }}
                    className={`stagger-fade group relative overflow-hidden rounded-[24px] p-4 text-left shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 ${highlightToneClasses(card.tone)}`}
                  >
                    <span className="inline-flex rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                      {card.badge}
                    </span>

                    <div className="mt-3 flex h-24 items-center justify-center rounded-2xl bg-white/65">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.label}
                          className="h-20 w-20 object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden
                        >
                          <path d="M4 7h16v10H4z" />
                          <path d="M8 7V5h8v2" />
                        </svg>
                      )}
                    </div>

                    <p className="mt-4 min-h-10 text-sm font-semibold text-slate-800">
                      {card.label}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {selectedCategoryName}
                  </p>
                  <h2 className="font-display text-[2.6rem] leading-none text-slate-900 sm:text-[3rem]">
                    Fresh Picks
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {viewProducts.length} product{viewProducts.length === 1 ? '' : 's'}
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-[24px] border border-[#e4e8ee] bg-white p-4"
                    >
                      <div className="aspect-square rounded-2xl bg-slate-100" />
                      <div className="mt-4 h-3 w-2/3 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                      <div className="mt-4 h-10 w-full rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && !error && viewProducts.length === 0 ? (
                <div className="rounded-2xl border border-[#dce2ea] bg-white p-8 text-center text-sm text-slate-500">
                  No products match these filters.
                </div>
              ) : null}

              {!loading && !error && viewProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
            </section>
          </section>
        </div>
      </div>

      <Link
        to="/cart"
        className="fixed bottom-4 left-1/2 z-30 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full border border-[#dbe2ec] bg-white/95 px-5 text-sm font-semibold text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.2)] backdrop-blur sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="9" cy="21" r="1.2" />
          <circle cx="19" cy="21" r="1.2" />
          <path d="M2 3h3l2.2 11h11.1l2-8H7" />
        </svg>
        Cart
      </Link>

      {toast ? (
        <div
          className={`fixed bottom-20 left-3 right-3 z-40 rounded-2xl border px-4 py-3 text-sm shadow-[0_16px_30px_rgba(15,23,42,0.2)] sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-xs ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>{toast.message}</span>
            <Link
              to="/cart"
              className="text-xs font-semibold underline underline-offset-2"
            >
              Cart
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
