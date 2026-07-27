import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProducts error:", error.message);
    throw error;
  }

  return data ?? [];
}

export async function addProduct(product: {
  name: string;
  price: number;
  photo_url?: string | null;
  options?: string | null;
  is_new?: boolean;
}): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        price: product.price,
        photo_url: product.photo_url ?? null,
        options: product.options ?? null,
        is_new: product.is_new ?? true,
        is_sold_out: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("addProduct error:", error.message);
    throw error;
  }

  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateProduct error:", error.message);
    throw error;
  }

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("deleteProduct error:", error.message);
    throw error;
  }
}