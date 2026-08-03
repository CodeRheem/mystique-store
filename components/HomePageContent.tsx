"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FavouriteIcon, ShoppingCart02Icon } from "hugeicons-react";
import { Libertinus_Serif, Stalemate } from "next/font/google";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import { Product } from "@/types/product";
import { getCartCount, getFavoriteCount } from "@/lib/storage";

const libertinusSerif = Libertinus_Serif({
  subsets: ["latin"],
  weight: "400",
});

const stalemate = Stalemate({
  subsets: ["latin"],
  weight: "400",
});

export default function HomePageContent({
  initialProducts,
  error,
}: {
  initialProducts: Product[];
  error: boolean;
}) {
  const [query, setQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      setFavoriteCount(getFavoriteCount());
      setCartCount(getCartCount());
    };

    updateCounts();
    window.addEventListener("mystique-storage-updated", updateCounts);
    return () => window.removeEventListener("mystique-storage-updated", updateCounts);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return initialProducts;

    return initialProducts.filter((product) => {
      const haystack = `${product.name} ${product.options ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [initialProducts, normalizedQuery]);

  const isSearching = normalizedQuery.length > 0;
  const hasResults = filteredProducts.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 animate-in fade-in slide-in-from-top-2 duration-500 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex w-full items-center justify-between">
            <Link href="/admin/login">
              <Image
                src="/logo.jpeg"
                alt="Mystique World logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>

            <h1
              className={`${stalemate.className} text-2xl flex-1 text-center font-bold text-primary`}
            >
              Mystique World
            </h1>

            <div className="flex items-center gap-3">
              <Link href="/favorites" className="relative rounded-full border border-border/60 bg-background/80 p-2 text-primary">
                <FavouriteIcon className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {favoriteCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative rounded-full border border-border/60 bg-background/80 p-2 text-primary">
                <ShoppingCart02Icon className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">
        <section className="py-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="border border-white-900 rounded-3xl p-4 -mt-4">
            <h2
              className={`${libertinusSerif.className} text-3xl font-bold text-primary`}
            >
              Welcome,
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              ...Mystify your senses. Define your style.
            </p>
            <ProductSearch
              query={query}
              onQueryChange={setQuery}
              totalProducts={initialProducts.length}
            />
          </div>
        </section>

        <section className="-my-3 py-8 animate-in fade-in slide-in-from-bottom-2 duration-700 border border-white-900 rounded-3xl">
          {error && (
            <p className="px-3 text-destructive">
              Couldn&apos;t load products right now. Please try again shortly.
            </p>
          )}

          {!error && initialProducts.length === 0 && (
            <div className="px-3 py-4 text-center text-muted-foreground">
              No products yet.
            </div>
          )}

          {!error && isSearching && !hasResults && (
            <div className="px-3 py-8 text-center">
              <p className="text-muted-foreground">
                No perfumes match “{query}”.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-primary text-sm underline mt-2"
              >
                Clear search and browse all perfumes
              </button>
            </div>
          )}

          {!error && hasResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch p-3">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in duration-700 h-full"
                  style={{
                    animationDelay: `${index * 75}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
