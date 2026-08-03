import { getProducts } from "@/lib/products";
import { Product } from "@/types/product";
import HomePageContent from "@/components/HomePageContent";

export const revalidate = 30;

export default async function HomePage() {
  let products: Product[] = [];
  let error = false;

  try {
    products = await getProducts();
  } catch {
    error = true;
    products = [];
  }

  return <HomePageContent initialProducts={products} error={error} />;
}