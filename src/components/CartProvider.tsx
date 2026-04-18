"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition,
} from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export type CartItem = {
  variantId: string
  productId: string
  productSlug: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

type PersistedCart = {
  items: CartItem[]
  version: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CART_STORAGE_PREFIX = "lilcake-cart"
const LEGACY_CART_KEY = "lilcake-cart"
const ANON_CART_KEY = "lilcake-cart-anon"

const CartContext = createContext<CartContextType | undefined>(undefined)

function getCartStorageKey(userId?: string) {
  return userId ? `${CART_STORAGE_PREFIX}-${userId}` : ANON_CART_KEY
}

function parsePersistedCart(rawValue: string | null): PersistedCart {
  if (!rawValue) {
    return { items: [], version: 0 }
  }

  try {
    const parsed = JSON.parse(rawValue)

    if (Array.isArray(parsed)) {
      return {
        items: parsed,
        version: 0,
      }
    }

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return {
        items: parsed.items,
        version:
          Number.isInteger(parsed.version) && parsed.version >= 0
            ? parsed.version
            : 0,
      }
    }
  } catch {
    return { items: [], version: 0 }
  }

  return { items: [], version: 0 }
}

function writePersistedCart(
  storageKey: string,
  items: CartItem[],
  version: number
) {
  localStorage.setItem(storageKey, JSON.stringify({ items, version }))
}

function clearAllCartStorageKeys(exceptKey?: string) {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)

    if (!key || !key.startsWith(CART_STORAGE_PREFIX) || key === exceptKey) {
      continue
    }

    localStorage.removeItem(key)
  }
}

function mergeCartItems(baseItems: CartItem[], incomingItems: CartItem[]) {
  const mergedItems = [...baseItems]

  incomingItems.forEach((incomingItem) => {
    const existingItem = mergedItems.find(
      (item) => item.variantId === incomingItem.variantId
    )

    if (existingItem) {
      existingItem.quantity = Math.max(
        existingItem.quantity,
        incomingItem.quantity
      )
      return
    }

    mergedItems.push(incomingItem)
  })

  return mergedItems
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [cartVersion, setCartVersion] = useState(0)
  const hydrateRequestRef = useRef(0)
  const cartVersionRef = useRef(0)
  const hydratedStorageKeyRef = useRef<string | null>(null)
  const skipNextServerSyncRef = useRef(false)

  const currentSearchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null

  const isStripeReturnFlow =
    pathname === "/checkout" &&
    currentSearchParams?.get("success") === "true" &&
    Boolean(currentSearchParams?.get("session_id"))

  const invalidatePendingHydration = useCallback(() => {
    hydrateRequestRef.current += 1
  }, [])

  const commitCartMutation = useCallback(() => {
    invalidatePendingHydration()
    skipNextServerSyncRef.current = false
    cartVersionRef.current += 1
    setCartVersion(cartVersionRef.current)
    return cartVersionRef.current
  }, [invalidatePendingHydration])

  const applyHydratedCart = useCallback(
    (nextItems: CartItem[], version: number, storageKey: string) => {
      cartVersionRef.current = version
      skipNextServerSyncRef.current = true
      hydratedStorageKeyRef.current = storageKey

      startTransition(() => {
        setItems(nextItems)
        setCartVersion(version)
      })
    },
    []
  )

  const syncCartToServer = useCallback(
    (nextItems: CartItem[], version: number) => {
      if (!session?.user?.id) {
        return
      }

      fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: nextItems,
          mode: "replace",
          version,
        }),
      }).catch(() => {})
    },
    [session?.user?.id]
  )

  useEffect(() => {
    if (status === "loading") {
      return
    }

    const userId = session?.user?.id
    const storageKey = getCartStorageKey(userId)

    if (isStripeReturnFlow) {
      hydrateRequestRef.current += 1
      clearAllCartStorageKeys(storageKey)
      writePersistedCart(storageKey, [], cartVersionRef.current)
      applyHydratedCart([], cartVersionRef.current, storageKey)
      setIsLoaded(true)
      return
    }

    let isActive = true
    const requestId = ++hydrateRequestRef.current

    const loadCart = async () => {
      try {
        const savedSnapshot = parsePersistedCart(
          localStorage.getItem(storageKey)
        )

        let currentLocalItems = savedSnapshot.items
        let currentVersion = savedSnapshot.version

        if (userId) {
          const anonSnapshot = parsePersistedCart(
            localStorage.getItem(ANON_CART_KEY)
          )

          if (anonSnapshot.items.length > 0) {
            currentLocalItems = mergeCartItems(currentLocalItems, anonSnapshot.items)
            currentVersion = Math.max(currentVersion, anonSnapshot.version)
            localStorage.removeItem(ANON_CART_KEY)
            writePersistedCart(storageKey, currentLocalItems, currentVersion)
          }

          localStorage.removeItem(LEGACY_CART_KEY)

          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: currentLocalItems,
              mode: "merge",
              version: currentVersion,
            }),
          })
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "No pudimos sincronizar el carrito")
          }

          const nextItems = Array.isArray(data.cart) ? data.cart : []
          const nextVersion =
            Number.isInteger(data.version) && data.version >= 0
              ? data.version
              : currentVersion

          if (isActive && requestId === hydrateRequestRef.current) {
            applyHydratedCart(nextItems, nextVersion, storageKey)
            writePersistedCart(storageKey, nextItems, nextVersion)
          }
        } else {
          const legacySnapshot = parsePersistedCart(
            localStorage.getItem(LEGACY_CART_KEY)
          )

          if (legacySnapshot.items.length > 0) {
            currentLocalItems = legacySnapshot.items
            currentVersion = Math.max(currentVersion, legacySnapshot.version)
            writePersistedCart(storageKey, currentLocalItems, currentVersion)
            localStorage.removeItem(LEGACY_CART_KEY)
          }

          if (isActive && requestId === hydrateRequestRef.current) {
            applyHydratedCart(currentLocalItems, currentVersion, storageKey)
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        if (isActive) {
          setIsLoaded(true)
        }
      }
    }

    void loadCart()

    return () => {
      isActive = false
    }
  }, [applyHydratedCart, isStripeReturnFlow, session?.user?.id, status])

  useEffect(() => {
    if (cartVersion !== cartVersionRef.current) {
      return
    }

    if (isStripeReturnFlow || !isLoaded || status === "loading") {
      return
    }

    const storageKey = getCartStorageKey(session?.user?.id)

    if (hydratedStorageKeyRef.current !== storageKey) {
      return
    }

    writePersistedCart(storageKey, items, cartVersion)

    if (skipNextServerSyncRef.current) {
      skipNextServerSyncRef.current = false
      return
    }

    syncCartToServer(items, cartVersion)
  }, [
    cartVersion,
    isLoaded,
    isStripeReturnFlow,
    items,
    session?.user?.id,
    status,
    syncCartToServer,
  ])

  const addToCart = useCallback(
    (item: CartItem) => {
      commitCartMutation()
      setItems((current) => {
        const existing = current.find((entry) => entry.variantId === item.variantId)

        if (existing) {
          return current.map((entry) =>
            entry.variantId === item.variantId
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry
          )
        }

        return [...current, item]
      })
    },
    [commitCartMutation]
  )

  const removeFromCart = useCallback(
    (variantId: string) => {
      commitCartMutation()
      setItems((current) => current.filter((item) => item.variantId !== variantId))
    },
    [commitCartMutation]
  )

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      commitCartMutation()

      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.variantId !== variantId))
        return
      }

      setItems((current) =>
        current.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        )
      )
    },
    [commitCartMutation]
  )

  const clearCart = useCallback(() => {
    const nextVersion = commitCartMutation()
    const storageKey = getCartStorageKey(session?.user?.id)

    hydratedStorageKeyRef.current = storageKey
    clearAllCartStorageKeys(storageKey)
    writePersistedCart(storageKey, [], nextVersion)
    setItems([])
  }, [commitCartMutation, session?.user?.id])

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }

  return context
}
