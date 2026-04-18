"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  startTransition,
} from "react"
import { useSession } from "next-auth/react"

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

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage & Sync with DB
  useEffect(() => {
    if (status === "loading") return

    let isActive = true

    const loadCart = async () => {
      const userId = session?.user?.id
      const storageKey = userId ? `lilcake-cart-${userId}` : "lilcake-cart-anon"

      try {
        const saved = localStorage.getItem(storageKey)
        let currentLocalItems: CartItem[] = saved ? JSON.parse(saved) : []

        if (userId) {
          const anonSaved = localStorage.getItem("lilcake-cart-anon")

          if (anonSaved) {
            const anonItems: CartItem[] = JSON.parse(anonSaved)

            if (anonItems.length > 0) {
              anonItems.forEach((anonItem) => {
                const existingItem = currentLocalItems.find(
                  (item) => item.variantId === anonItem.variantId
                )

                if (existingItem) {
                  existingItem.quantity = Math.max(
                    existingItem.quantity,
                    anonItem.quantity
                  )
                } else {
                  currentLocalItems.push(anonItem)
                }
              })

              localStorage.removeItem("lilcake-cart-anon")
              localStorage.setItem(storageKey, JSON.stringify(currentLocalItems))
            }
          }

          localStorage.removeItem("lilcake-cart")

          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: currentLocalItems, mode: "merge" }),
          })
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "No pudimos sincronizar el carrito")
          }

          if (data.cart && isActive) {
            startTransition(() => {
              setItems(data.cart)
            })
            localStorage.setItem(storageKey, JSON.stringify(data.cart))
          }
        } else {
          const legacy = localStorage.getItem("lilcake-cart")

          if (legacy) {
            currentLocalItems = JSON.parse(legacy)
            localStorage.setItem("lilcake-cart-anon", legacy)
            localStorage.removeItem("lilcake-cart")
          }

          if (isActive) {
            startTransition(() => {
              setItems(currentLocalItems)
            })
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
  }, [session?.user?.id, status])

  // Save changes automatically
  useEffect(() => {
    if (isLoaded && status !== "loading") {
      const storageKey = session?.user?.id
        ? `lilcake-cart-${session.user.id}`
        : "lilcake-cart-anon"
      localStorage.setItem(storageKey, JSON.stringify(items))

      // Fire and forget: push to db if logged in
      if (session?.user?.id) {
        fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, mode: "replace" }),
        }).catch(() => {})
      }
    }
  }, [items, isLoaded, session, status])

  const addToCart = useCallback((item: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId)
      if (existing) {
        return current.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...current, item]
    })
  }, [])

  const removeFromCart = useCallback((variantId: string) => {
    setItems((current) => current.filter((i) => i.variantId !== variantId))
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((i) => i.variantId !== variantId))
      return
    }
    setItems((current) =>
      current.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

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
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
