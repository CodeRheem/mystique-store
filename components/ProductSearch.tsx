"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Search01Icon, Cancel01Icon } from "hugeicons-react";
import ProductCard from "@/components/ProductCard";

export default function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-2">
        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 rounded-full"
        />
        {isSearching && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            aria-label="Clear search"
          >
            <Cancel01Icon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* State: store has products, but none match the search */}
      {isSearching && filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products found for &quot;{query}&quot;.
          </p>
          <button
            onClick={() => setQuery("")}
            className="text-primary text-sm underline mt-2"
          >
            Clear search and browse all products
          </button>
        </div>
      )}

      {/* State: results to show (either full list or filtered matches) */}
      {filteredProducts.length > 0 && (
        <>
          {isSearching && (
            <p className="text-sm text-muted-foreground mb-4">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in duration-700"
                style={{ animationDelay: `${index * 75}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}