"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FavouriteIcon, ShoppingCart02Icon } from "hugeicons-react";
import { Libertinus_Serif, Stalemate } from "next/font/google";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import { Product } from "@/types/product";

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
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
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

            <div className="flex items-center space-x-6">
              <Link href="/favorites">
                <FavouriteIcon className="h-6 w-6 text-primary" />
              </Link>
              <Link href="/cart">
                <ShoppingCart02Icon className="h-6 w-6 text-primary" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch p-3">
            {error && (
              <p className="text-destructive col-span-full">
                Couldn&apos;t load products right now. Please try again shortly.
              </p>
            )}

            {!error && initialProducts.length === 0 && (
              <p className="text-muted-foreground text-center col-span-full">
                No products yet — check back soon!
              </p>
            )}

            {!error && isSearching && !hasResults && (
              <div className="col-span-full py-8 text-center">
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

            {!error && hasResults &&
              filteredProducts.map((product, index) => (
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
        </section>
      </div>
    </main>
  );
}
