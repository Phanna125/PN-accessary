import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'

type Product = {
  id: string
  title: string
  priceCents: number
  imageUrl?: string | null
}

type CartItem = {
  id: string
  productId: string
  quantity: number
  product: Product
}

type CartResponse = {
  items: CartItem[]
  totalCents: number
}

type CheckoutForm = {
  shippingName: string
  shippingPhone: string
  shippingStreet: string
  shippingHouse: string
  shippingCityProvince: string
  shippingDistrict: string
}

const initialCheckoutForm: CheckoutForm = {
  shippingName: '',
  shippingPhone: '',
  shippingStreet: '',
  shippingHouse: '',
  shippingCityProvince: '',
  shippingDistrict: '',
}

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [checkoutForm, setCheckoutForm] =
    useState<CheckoutForm>(initialCheckoutForm)

  async function loadCart() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<CartResponse>('/cart', true)
      setCart(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please login to view cart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  async function updateQuantity(productId: string, quantity: number) {
    try {
      await apiPatch(`/cart/items/${productId}`, { quantity }, true)
      await loadCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update cart.')
    }
  }

  async function removeItem(productId: string) {
    try {
      await apiDelete(`/cart/items/${productId}`, true)
      await loadCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove item.')
    }
  }

  async function addSample() {
    setError('Add items from the Products page.')
  }

  function updateCheckoutField<K extends keyof CheckoutForm>(key: K, value: string) {
    setCheckoutForm((prev) => ({ ...prev, [key]: value }))
  }

  function buildCheckoutPayload() {
    return {
      shippingName: checkoutForm.shippingName.trim(),
      shippingPhone: checkoutForm.shippingPhone.trim(),
      shippingStreet: checkoutForm.shippingStreet.trim(),
      shippingHouse: checkoutForm.shippingHouse.trim(),
      shippingCityProvince: checkoutForm.shippingCityProvince.trim(),
      shippingDistrict: checkoutForm.shippingDistrict.trim(),
    }
  }

  function missingRequiredFields() {
    const payload = buildCheckoutPayload()
    const required: Array<keyof CheckoutForm> = [
      'shippingName',
      'shippingPhone',
      'shippingStreet',
      'shippingHouse',
      'shippingCityProvince',
      'shippingDistrict',
    ]
    return required.filter((field) => !payload[field])
  }

  async function checkout() {
    if (!cart || cart.items.length === 0) {
      setCheckoutMessage('Your cart is empty.')
      return
    }

    const missing = missingRequiredFields()
    if (missing.length > 0) {
      setCheckoutMessage('Please complete all required shipping fields.')
      return
    }

    setCheckingOut(true)
    setCheckoutMessage(null)
    try {
      const order = await apiPost<{ id: string }>('/orders', buildCheckoutPayload(), true)
      setLastOrderId(order.id)
      setCheckoutMessage('Order placed!')
      setCheckoutForm(initialCheckoutForm)
      await loadCart()
    } catch (err) {
      setCheckoutMessage(
        err instanceof Error
          ? err.message
          : 'Could not place order. Please try again.',
      )
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Step 4
          </p>
          <h2 className="mt-2 text-3xl font-bold">Your Cart</h2>
          <p className="mt-1 text-white/70">
            Update quantities or remove items.
          </p>
        </div>
        <Link to="/" className="text-sm text-white/60 hover:text-white">
          {'<- Back to products'}
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-8 text-white/70">
          Loading cart...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-3xl bg-rose-500/20 p-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {checkoutMessage ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm text-white/70">
          {checkoutMessage}
          {lastOrderId ? (
            <div className="mt-2 text-xs text-white/60">
              Order ID: {lastOrderId} -{' '}
              <Link to="/orders" className="underline">
                view orders
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && cart && cart.items.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white/10 p-8 text-center text-white/70">
          Your cart is empty. Add items from the products page.
        </div>
      ) : null}

      {!loading && cart && cart.items.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/10 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white/10">
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
                  <p className="text-sm text-white/60">
                    ${(item.product.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                  }
                  className="rounded-full bg-white/10 px-3 py-1 text-sm"
                >
                  -
                </button>
                <span className="min-w-[28px] text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full bg-rose-400/80 px-3 py-1 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-3xl bg-white/10 p-4 text-lg font-semibold">
            <span>Total</span>
            <span>${(cart.totalCents / 100).toFixed(2)}</span>
          </div>

          <div className="rounded-3xl bg-white/10 p-4">
            <h3 className="text-lg font-semibold">Shipping details</h3>
            <p className="mt-1 text-sm text-white/60">
              Required for checkout and Telegram order notifications.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={checkoutForm.shippingName}
                onChange={(event) =>
                  updateCheckoutField('shippingName', event.target.value)
                }
                placeholder="Full name"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={checkoutForm.shippingPhone}
                onChange={(event) =>
                  updateCheckoutField('shippingPhone', event.target.value)
                }
                placeholder="Phone"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={checkoutForm.shippingStreet}
                onChange={(event) =>
                  updateCheckoutField('shippingStreet', event.target.value)
                }
                placeholder="Street"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={checkoutForm.shippingHouse}
                onChange={(event) =>
                  updateCheckoutField('shippingHouse', event.target.value)
                }
                placeholder="House"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={checkoutForm.shippingCityProvince}
                onChange={(event) =>
                  updateCheckoutField('shippingCityProvince', event.target.value)
                }
                placeholder="City / Province"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
              <input
                type="text"
                value={checkoutForm.shippingDistrict}
                onChange={(event) =>
                  updateCheckoutField('shippingDistrict', event.target.value)
                }
                placeholder="District"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-sky focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={checkout}
            disabled={checkingOut}
            className="rounded-full bg-mint px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {checkingOut ? 'Placing order...' : 'Checkout'}
          </button>
        </div>
      ) : null}

      {!loading && !cart ? (
        <button
          type="button"
          onClick={addSample}
          className="mt-6 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-ink"
        >
          Add items
        </button>
      ) : null}
    </div>
  )
}
