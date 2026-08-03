"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { addProductToCart, getCartCount, isFavoriteProduct, toggleFavoriteProduct } from "@/lib/storage";
import { SparklesIcon, FavouriteIcon, ShoppingCart02Icon } from "hugeicons-react";

export default function ProductCard({ product }: { product: Product }) {
  const [customerName, setCustomerName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [open, setOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setFavorite(isFavoriteProduct(product.id));
    setCartCount(getCartCount());
  }, [product.id]);

  const optionsList = product.options
    ? product.options.split(",").map((o) => o.trim())
    : [];

  function handleOrder() {
    const link = buildWhatsAppOrderLink({
      customerName: customerName || "Customer",
      productName: product.name,
      selectedOption: selectedOption || undefined,
    });
    window.open(link, "_blank");
    setOpen(false);
  }

  function handleToggleFavorite() {
    const nextState = toggleFavoriteProduct(product.id);
    setFavorite(nextState.includes(product.id));
  }

  function handleAddToCart() {
    const nextItems = addProductToCart(product, selectedOption || null);
    setCartCount(nextItems.reduce((total, item) => total + item.quantity, 0));
  }

  return (
    <Card className="group h-full overflow-hidden flex flex-col rounded-2xl border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
      {/* Photo */}
      <div className="relative h-64 min-h-64 bg-muted flex items-center justify-center p-4 overflow-hidden">
        {product.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.photo_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-center text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">No photo yet</p>
              <p className="mt-1 text-xs">Add an image to show it here</p>
            </div>
          </div>
        )}

        {/* Sold out overlay dims the whole photo for clear unavailability */}
        {product.is_sold_out && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
        )}
      </div>

      <CardContent className="pt-3 flex-1 flex flex-col">
        <div className="mb-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="rounded-full border border-border bg-background/90 p-2 text-primary shadow-sm"
            aria-label="Add to favorites"
          >
            <FavouriteIcon className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full border border-border bg-background/90 p-2 text-primary shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart02Icon className="h-4 w-4" />
            {cartCount > 0 && <span className="ml-1 text-[10px]">{cartCount}</span>}
          </button>
        </div>
        {/* Status pills */}
        <div className="flex gap-2 mb-3">
          {product.is_new && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <SparklesIcon className="h-3 w-3" />
              New Arrival
            </span>
          )}
          {product.is_sold_out && (
            <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              Sold Out
            </span>
          )}
        </div>

        {/* Name + price */}
        <h3 className="font-heading text-lg leading-snug tracking-tight line-clamp-2 min-h-14">
          {product.name}
        </h3>
        <p className="mt-1 text-primary font-semibold tracking-wide">
          ₦{product.price.toLocaleString()}
        </p>

        {/* Options as refined pills instead of plain text */}
        {optionsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {optionsList.map((opt) => (
              <span
                key={opt}
                className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
              >
                {opt}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full rounded-full font-medium tracking-wide"
              disabled={product.is_sold_out}
            >
              {product.is_sold_out ? "Currently Unavailable" : "Order on WhatsApp"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Order {product.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Amaka"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {optionsList.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="option">Choose an option</Label>
                  <select
                    id="option"
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {optionsList.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button className="w-full rounded-full" onClick={handleOrder}>
                Place Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}