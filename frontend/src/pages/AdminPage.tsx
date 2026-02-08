import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from '../lib/api'

type Category = { id: string; name: string }
type Product = {
  id: string
  title: string
  priceCents: number
  stock: number
  sku?: string | null
  description?: string | null
  imageUrl?: string | null
  isActive?: boolean
  category?: Category | null
}

type Order = {
  id: string
  status: string
  totalCents: number
  createdAt: string
}

const STATUS_OPTIONS = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'COMPLETED',
  'CANCELED',
]

export function AdminPage() {
  const [tab, setTab] = useState<'categories' | 'products' | 'orders'>(
    'categories',
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newProduct, setNewProduct] = useState({
    title: '',
    sku: '',
    description: '',
    imageUrl: '',
    isActive: true,
    priceCents: 0,
    stock: 0,
    categoryId: '',
  })

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState({
    title: '',
    sku: '',
    description: '',
    imageUrl: '',
    isActive: true,
    priceCents: 0,
    stock: 0,
    categoryId: '',
  })
  const [confirmCategoryId, setConfirmCategoryId] = useState<string | null>(null)
  const [confirmProductId, setConfirmProductId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const tabs = useMemo(
    () => [
      { id: 'categories', label: 'Categories' },
      { id: 'products', label: 'Products' },
      { id: 'orders', label: 'Orders' },
    ],
    [],
  )

  async function loadAll() {
    try {
      const [cats, prods, ords] = await Promise.all([
        apiGet<Category[]>('/categories', true),
        apiGet<Product[]>('/products?includeInactive=true', true),
        apiGet<Order[]>('/orders', true),
      ])
      setCategories(cats)
      setProducts(prods)
      setOrders(ords)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please login as admin.')
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function createCategory() {
    setMessage(null)
    setError(null)
    try {
      const category = await apiPost<Category>(
        '/categories',
        { name: newCategoryName },
        true,
      )
      setCategories((prev) => [...prev, category])
      setNewCategoryName('')
      setMessage('Category created!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category.')
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
  }

  async function saveCategory() {
    if (!editingCategoryId) return
    setMessage(null)
    setError(null)
    try {
      const updated = await apiPatch<Category>(
        `/categories/${editingCategoryId}`,
        { name: editingCategoryName },
        true,
      )
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updated.id ? updated : cat)),
      )
      setEditingCategoryId(null)
      setEditingCategoryName('')
      setMessage('Category updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category.')
    }
  }

  async function deleteCategory(id: string) {
    setMessage(null)
    setError(null)
    try {
      await apiDelete(`/categories/${id}`, true)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      setMessage('Category deleted.')
      setConfirmCategoryId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  async function createProduct() {
    setMessage(null)
    setError(null)
    try {
      const created = await apiPost<Product>(
        '/products',
        {
          title: newProduct.title,
          sku: newProduct.sku,
          description: newProduct.description || undefined,
          imageUrl: newProduct.imageUrl || undefined,
          isActive: newProduct.isActive,
          priceCents: newProduct.priceCents,
          stock: newProduct.stock,
          categoryId: newProduct.categoryId,
        },
        true,
      )
      setProducts((prev) => [created, ...prev])
      setNewProduct({
        title: '',
        sku: '',
        description: '',
        imageUrl: '',
        isActive: true,
        priceCents: 0,
        stock: 0,
        categoryId: '',
      })
      setMessage('Product created!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product.')
    }
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id)
    setEditingProduct({
      title: product.title,
      sku: product.sku ?? '',
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive ?? true,
      priceCents: product.priceCents,
      stock: product.stock,
      categoryId: product.category?.id ?? '',
    })
  }

  async function saveProduct() {
    if (!editingProductId) return
    setMessage(null)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        title: editingProduct.title,
        sku: editingProduct.sku,
        description: editingProduct.description || undefined,
        imageUrl: editingProduct.imageUrl || undefined,
        isActive: editingProduct.isActive,
        priceCents: editingProduct.priceCents,
        stock: editingProduct.stock,
      }
      if (editingProduct.categoryId) {
        payload.categoryId = editingProduct.categoryId
      }

      const updated = await apiPatch<Product>(
        `/products/${editingProductId}`,
        payload,
        true,
      )
      setProducts((prev) =>
        prev.map((product) =>
          product.id === updated.id ? updated : product,
        ),
      )
      setEditingProductId(null)
      setEditingProduct({
        title: '',
        sku: '',
        description: '',
        imageUrl: '',
        isActive: true,
        priceCents: 0,
        stock: 0,
        categoryId: '',
      })
      setMessage('Product updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product.')
    }
  }

  async function disableProduct(id: string) {
    setMessage(null)
    setError(null)
    try {
      await apiDelete(`/products/${id}`, true)
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, isActive: false } : product,
        ),
      )
      setMessage('Product disabled.')
      setConfirmProductId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable product.')
    }
  }

  async function updateOrderStatus(id: string, status: string) {
    setMessage(null)
    setError(null)
    try {
      const updated = await apiPatch<Order>(
        `/orders/${id}/status`,
        { status },
        true,
      )
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updated : order)),
      )
      setMessage('Order updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order.')
    }
  }

  async function handleUpload(
    file: File,
    target: 'new' | 'edit',
  ) {
    setUploading(true)
    setUploadError(null)
    try {
      const url = await apiUpload('/upload', file)
      if (target === 'new') {
        setNewProduct((prev) => ({ ...prev, imageUrl: url }))
      } else {
        setEditingProduct((prev) => ({ ...prev, imageUrl: url }))
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Step 6
          </p>
          <h2 className="mt-2 text-3xl font-bold">Admin Dashboard</h2>
          <p className="mt-1 text-white/70">
            Manage categories, products, and orders.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setTab(item.id as 'categories' | 'products' | 'orders')
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm text-white/70">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-500/20 p-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {tab === 'categories' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-lg font-semibold">Create category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Category name"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
            />
            <button
              type="button"
              onClick={createCategory}
              className="mt-4 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-ink"
            >
              Create
            </button>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-lg font-semibold">All categories</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2"
                >
                  {editingCategoryId === cat.id ? (
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(event) =>
                        setEditingCategoryName(event.target.value)
                      }
                      className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white focus:border-sky focus:outline-none"
                    />
                  ) : (
                    <span>{cat.name}</span>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    {editingCategoryId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={saveCategory}
                          className="rounded-full bg-mint px-3 py-1 text-ink"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          className="rounded-full bg-white/10 px-3 py-1 text-white/70"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className="rounded-full bg-white/10 px-3 py-1 text-white/70"
                        >
                          Edit
                        </button>
                        {confirmCategoryId === cat.id ? (
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat.id)}
                            className="rounded-full bg-rose-500 px-3 py-1 text-white"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCategoryId(cat.id)}
                            className="rounded-full bg-rose-400/80 px-3 py-1 text-white"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === 'products' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-lg font-semibold">Create product</h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={newProduct.title}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, title: event.target.value })
                }
                placeholder="Product title"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={newProduct.sku}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, sku: event.target.value })
                }
                placeholder="SKU"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <textarea
                value={newProduct.description}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    description: event.target.value,
                  })
                }
                placeholder="Description (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={newProduct.imageUrl}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, imageUrl: event.target.value })
                }
                placeholder="Image URL (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <label className="text-xs text-white/60">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-xs text-white/60"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) handleUpload(file, 'new')
                  }}
                />
              </label>
              {uploading ? (
                <p className="text-xs text-white/60">Uploading...</p>
              ) : null}
              {uploadError ? (
                <p className="text-xs text-rose-300">{uploadError}</p>
              ) : null}
              {newProduct.imageUrl ? (
                <div className="overflow-hidden rounded-2xl bg-white/10">
                  <img
                    src={newProduct.imageUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = ''
                    }}
                  />
                </div>
              ) : null}
              <input
                type="number"
                value={newProduct.priceCents}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    priceCents: Number(event.target.value),
                  })
                }
                placeholder="Price in cents"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <input
                type="number"
                value={newProduct.stock}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    stock: Number(event.target.value),
                  })
                }
                placeholder="Stock"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={newProduct.isActive}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      isActive: event.target.checked,
                    })
                  }
                />
                Active product
              </label>
              <select
                value={newProduct.categoryId}
                onChange={(event) =>
                  setNewProduct({
                    ...newProduct,
                    categoryId: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky focus:outline-none"
              >
                <option value="" className="bg-white text-slate-900">
                  Select category
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-white text-slate-900"
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={createProduct}
                className="w-full rounded-full bg-mint px-4 py-2 text-sm font-semibold text-ink"
              >
                Create product
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-lg font-semibold">Latest products</h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl bg-white/5 px-3 py-3">
                  {editingProductId === product.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingProduct.title}
                        onChange={(event) =>
                          setEditingProduct({
                            ...editingProduct,
                            title: event.target.value,
                          })
                        }
                        className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                      />
                      <input
                        type="text"
                        value={editingProduct.sku}
                        onChange={(event) =>
                          setEditingProduct({
                            ...editingProduct,
                            sku: event.target.value,
                          })
                        }
                        className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                      />
                      <textarea
                        value={editingProduct.description}
                        onChange={(event) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: event.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                      />
                      <input
                        type="text"
                        value={editingProduct.imageUrl}
                        onChange={(event) =>
                          setEditingProduct({
                            ...editingProduct,
                            imageUrl: event.target.value,
                          })
                        }
                        className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                      />
                      <label className="text-xs text-white/60">
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-2 block w-full text-xs text-white/60"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) handleUpload(file, 'edit')
                          }}
                        />
                      </label>
                      {uploading ? (
                        <p className="text-xs text-white/60">Uploading...</p>
                      ) : null}
                      {uploadError ? (
                        <p className="text-xs text-rose-300">{uploadError}</p>
                      ) : null}
                      {editingProduct.imageUrl ? (
                        <div className="overflow-hidden rounded-2xl bg-white/10">
                          <img
                            src={editingProduct.imageUrl}
                            alt="Preview"
                            className="h-32 w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = ''
                            }}
                          />
                        </div>
                      ) : null}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="number"
                          value={editingProduct.priceCents}
                          onChange={(event) =>
                            setEditingProduct({
                              ...editingProduct,
                              priceCents: Number(event.target.value),
                            })
                          }
                          className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                        />
                        <input
                          type="number"
                          value={editingProduct.stock}
                          onChange={(event) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: Number(event.target.value),
                            })
                          }
                          className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          checked={editingProduct.isActive}
                          onChange={(event) =>
                            setEditingProduct({
                              ...editingProduct,
                              isActive: event.target.checked,
                            })
                          }
                        />
                        Active
                      </label>
                      <select
                        value={editingProduct.categoryId}
                        onChange={(event) =>
                          setEditingProduct({
                            ...editingProduct,
                            categoryId: event.target.value,
                          })
                        }
                        className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                      >
                        <option value="" className="bg-white text-slate-900">
                          Select category
                        </option>
                        {categories.map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id}
                            className="bg-white text-slate-900"
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={saveProduct}
                          className="rounded-full bg-mint px-3 py-1 text-ink"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProductId(null)}
                          className="rounded-full bg-white/10 px-3 py-1 text-white/70"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {product.title}
                          {!product.isActive ? (
                            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                              Inactive
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-white/60">
                          {product.category?.name ?? 'Uncategorized'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-white/60">
                        <p>${(product.priceCents / 100).toFixed(2)}</p>
                        <p>Stock: {product.stock}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => startEditProduct(product)}
                          className="rounded-full bg-white/10 px-3 py-1 text-white/70"
                        >
                          Edit
                        </button>
                        {confirmProductId === product.id ? (
                          <button
                            type="button"
                            onClick={() => disableProduct(product.id)}
                            className="rounded-full bg-rose-500 px-3 py-1 text-white"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmProductId(product.id)}
                            className="rounded-full bg-rose-400/80 px-3 py-1 text-white"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'orders' ? (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl bg-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value)
                    }
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-white text-slate-900"
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-white/60">
                    ${(order.totalCents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
