"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { Product } from "@/types/product";
import { getFavoriteProductIds, toggleFavoriteProduct } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { FavouriteIcon, ArrowLeft01Icon, Delete01Icon } from "hugeicons-react";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteProductIds());

    async function loadProducts() {
      const allProducts = await getProducts();
      setProducts(allProducts);
    }

    loadProducts();

    const handleStorageUpdate = () => setFavoriteIds(getFavoriteProductIds());
    window.addEventListener("mystique-storage-updated", handleStorageUpdate);
    return () => window.removeEventListener("mystique-storage-updated", handleStorageUpdate);
  }, []);

  const favoriteProducts = useMemo(() => {
    return products.filter((product) => favoriteIds.includes(product.id));
  }, [favoriteIds, products]);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft01Icon className="h-4 w-4" />
            Back to shop
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FavouriteIcon className="h-4 w-4" />
            Favorites
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {favoriteProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <p>No favorite perfumes yet.</p>
            <Link href="/" className="mt-3 inline-flex text-sm text-primary underline">
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-center text-xs text-muted-foreground">
                    No image
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-medium">{product.name}</h2>
                        <p className="text-sm text-primary">₦{product.price.toLocaleString()}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setFavoriteIds(toggleFavoriteProduct(product.id))}
                      >
                        <Delete01Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href="/">View product</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
