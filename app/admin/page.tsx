"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/products";
import { uploadProductPhoto } from "@/lib/uploadphoto";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Spinner } from "@/components/ui/spinner";

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
  const [searchQuery, setSearchQuery] = useState("");

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
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loveDialogOpen, setLoveDialogOpen] = useState(false);

  useEffect(() => {
    if (session) setLoveDialogOpen(true);
  }, [session]);

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

  function openDeleteDialog(product: Product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;

    setDeletingProductId(productToDelete.id);
    setError("");

    try {
      await deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch {
      setError("Couldn't delete product.");
    } finally {
      setDeletingProductId(null);
    }
  }

  function handleViewStore() {
    window.location.assign("/");
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedSearchQuery
    ? products.filter((product) => {
        const haystack = `${product.name} ${product.options ?? ""} ${product.price}`.toLowerCase();
        return haystack.includes(normalizedSearchQuery);
      })
    : products;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Spinner /> Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Hello Tobi,</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewStore}>
              View Store
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
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
                  <Label htmlFor="options">Options (ml)</Label>
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
                  {uploadingPhoto ? (
                    <>
                      <Spinner /> Uploading photo...
                    </>
                  ) : saving ? (
                    <>
                      <Spinner /> Saving...
                    </>
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <Label htmlFor="admin-search" className="text-sm font-medium">
              Search products
            </Label>
            <Input
              id="admin-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, option, or price"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="sm:mt-7"
            onClick={() => setSearchQuery("")}
            disabled={!searchQuery}
          >
            Clear search
          </Button>
        </div>

        {error && !dialogOpen && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {productsLoading && (
          <p className="text-muted-foreground flex items-center gap-2">
            <Spinner /> Loading products...
          </p>
        )}

        {!productsLoading && products.length === 0 && (
          <p className="text-muted-foreground">No products yet. Add your first one below.</p>
        )}

        {searchQuery && !productsLoading && filteredProducts.length === 0 && (
          <p className="mb-4 text-sm text-muted-foreground">
            No products match “{searchQuery}”.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.photo_url}
                  alt={product.name}
                  className="h-40 w-full object-contain bg-muted"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted text-center text-sm text-muted-foreground">
                  No photo yet
                </div>
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
                    onClick={() => openDeleteDialog(product)}
                    disabled={deletingProductId === product.id}
                  >
                    {deletingProductId === product.id ? (
                      <>
                        <Spinner /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will permanently remove <span className="font-medium text-foreground">{productToDelete?.name}</span> from your store.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={!!deletingProductId}>
                {deletingProductId ? (
                  <>
                    <Spinner /> Deleting...
                  </>
                ) : (
                  "Delete product"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}