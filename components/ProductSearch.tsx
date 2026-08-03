"use client";

import { Input } from "@/components/ui/input";
import { Search01Icon, Cancel01Icon } from "hugeicons-react";

export default function ProductSearch({
  query,
  onQueryChange,
  totalProducts,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  totalProducts: number;
}) {
  const isSearching = query.trim().length > 0;

  return (
    <div>
      <div className="relative mb-3">
        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search perfumes..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-3xl"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label="Clear search"
          >
            <Cancel01Icon className="h-4 w-4" />
          </button>
        )}
      </div>

      {isSearching && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {totalProducts > 0 ? "matching" : "0"} perfumes for “{query}”.
        </p>
      )}
    </div>
  );
}