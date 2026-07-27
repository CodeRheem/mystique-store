"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function ProductCard({ product }: { product: Product }) {
  const [customerName, setCustomerName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [open, setOpen] = useState(false);

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

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-80 bg-muted flex items-center justify-center p-3">
        {product.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.photo_url}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No photo
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.is_new && <Badge>New</Badge>}
          {product.is_sold_out && <Badge variant="destructive">Sold Out</Badge>}
        </div>
      </div>

      <CardContent className="pt-4 flex-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-muted-foreground">₦{product.price.toLocaleString()}</p>
        {optionsList.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Options: {optionsList.join(", ")}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={product.is_sold_out}>
              {product.is_sold_out ? "Sold Out" : "Order on WhatsApp"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order {product.name}</DialogTitle>
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

              <Button className="w-full" onClick={handleOrder}>
                Send Order on WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}