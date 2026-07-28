"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/products";
import { uploadProductPhoto } from "@/lib/uploadphoto";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { session, loading } = useRequireAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState("");

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    photo_url: "",
    options: "",
    is_new: true,
  });
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // Formats a raw number string with thousand separators as she types, e.g. "5000" -> "5,000"
  function formatPriceInput(value: string): string {
    const digitsOnly = value.replace(/[^\d]/g, "");
    if (!digitsOnly) return "";
    return Number(digitsOnly).toLocaleString("en-NG");
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, price: formatPriceInput(e.target.value) });
  }

  useEffect(() => {
    if (session) loadProducts();
  }, [session]);

  async function loadProducts() {
    setProductsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError("Couldn't load products. Please refresh.");
    } finally {
      setProductsLoading(false);
    }
  }

  function openAddDialog() {
    setEditingProduct(null);
    setForm({ name: "", price: "", photo_url: "", options: "", is_new: true });
    setPhotoFile(null);
    setPhotoPreview("");
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: formatPriceInput(String(product.price)),
      photo_url: product.photo_url ?? "",
      options: product.options ?? "",
      is_new: product.is_new,
    });
    setPhotoFile(null);
    setPhotoPreview(product.photo_url ?? "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // If she picked a new photo, upload it first and use the resulting URL
      let photoUrl = editingProduct?.photo_url ?? null;
      if (photoFile) {
        setUploadingPhoto(true);
        photoUrl = await uploadProductPhoto(photoFile);
        setUploadingPhoto(false);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: form.name,
          price: Number(form.price.replace(/,/g, "")),
          photo_url: photoUrl,
          options: form.options || null,
          is_new: form.is_new,
        });
      } else {
        await addProduct({
          name: form.name,
          price: Number(form.price.replace(/,/g, "")),
          photo_url: photoUrl,
          options: form.options || null,
          is_new: form.is_new,
        });
      }
      setDialogOpen(false);
      await loadProducts();
    } catch {
      setError("Couldn't save product. Please try again.");
      setUploadingPhoto(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSoldOut(product: Product) {
    try {
      await updateProduct(product.id, { is_sold_out: !product.is_sold_out });
      await loadProducts();
    } catch {
      setError("Couldn't update product.");
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Delete "${product.name}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch {
      setError("Couldn't delete product.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Products</h2>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add Product"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Vanilla Perfume"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="numeric"
                    value={form.price}
                    onChange={handlePriceChange}
                    placeholder="e.g. 5,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Product Photo</Label>
                  {photoPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-40 object-contain bg-muted rounded-md border mb-2"
                    />
                  )}
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a photo from your gallery or camera.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="options">Options (comma-separated)</Label>
                  <Input
                    id="options"
                    value={form.options}
                    onChange={(e) => setForm({ ...form, options: e.target.value })}
                    placeholder="Small, Medium, Large"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                  />
                  Mark as new
                </label>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {uploadingPhoto
                    ? "Uploading photo..."
                    : saving
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && !dialogOpen && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {productsLoading && <p className="text-muted-foreground">Loading products...</p>}

        {!productsLoading && products.length === 0 && (
          <p className="text-muted-foreground">No products yet. Add your first one above.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.photo_url}
                  alt={product.name}
                  className="w-full h-40 object-contain bg-muted"
                />
              )}
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {product.is_new && <Badge>New</Badge>}
                    {product.is_sold_out && (
                      <Badge variant="destructive">Sold Out</Badge>
                    )}
                  </div>
                </div>

                {product.options && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Options: {product.options}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleSoldOut(product)}
                  >
                    {product.is_sold_out ? "Mark Available" : "Mark Sold Out"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}