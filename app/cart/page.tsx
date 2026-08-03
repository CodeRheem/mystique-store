"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { Product } from "@/types/product";
import { getCartItems, removeCartItem, updateCartItemQuantity } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, ShoppingCart02Icon, Delete01Icon } from "hugeicons-react";

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState(getCartItems());

  useEffect(() => {
    async function loadProducts() {
      const allProducts = await getProducts();
      setProducts(allProducts);
    }

    loadProducts();

    const handleStorageUpdate = () => setCartItems(getCartItems());
    window.addEventListener("mystique-storage-updated", handleStorageUpdate);
    return () => window.removeEventListener("mystique-storage-updated", handleStorageUpdate);
  }, []);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft01Icon className="h-4 w-4" />
            Back to shop
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart02Icon className="h-4 w-4" />
            Cart
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <p>Your cart is empty.</p>
            <Link href="/" className="mt-3 inline-flex text-sm text-primary underline">
              Add some perfumes
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.7fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="rounded-3xl border border-border bg-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-center text-xs text-muted-foreground">
                      No image
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="font-medium">{item.name}</h2>
                          <p className="text-sm text-primary">₦{item.price.toLocaleString()}</p>
                          {item.options && <p className="text-xs text-muted-foreground">{item.options}</p>}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setCartItems(removeCartItem(item.productId))}
                        >
                          <Delete01Icon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCartItems(updateCartItemQuantity(item.productId, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCartItems(updateCartItemQuantity(item.productId, item.quantity + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="font-medium">Order summary</h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
              <Button className="mt-6 w-full rounded-full">Continue to WhatsApp</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
