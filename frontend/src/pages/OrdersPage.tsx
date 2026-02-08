import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

type OrderItem = {
  id: string
  quantity: number
  priceCents: number
  product: { id: string; title: string; imageUrl?: string | null }
}

type Order = {
  id: string
  status: string
  totalCents: number
  createdAt: string
  items: OrderItem[]
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Order[]>('/orders', true)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please login to view orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Step 5
          </p>
          <h2 className="mt-2 text-3xl font-bold">Orders</h2>
          <p className="mt-1 text-white/70">
            View past orders. Create new orders from the cart checkout form.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-8 text-white/70">
          Loading orders...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-500/20 p-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-8 text-center text-white/70">
          No orders yet. Create one from your cart.
        </div>
      ) : null}

      {!loading && orders.length > 0 ? (
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
                <div className="text-right">
                  <p className="text-sm text-white/60">Status</p>
                  <p className="font-semibold">{order.status}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/40">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{item.product.title}</p>
                        <p className="text-xs text-white/60">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/70">
                      ${(item.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                <span>Total</span>
                <span className="text-lg font-semibold text-white">
                  ${(order.totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
