import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";


export const revalidate = 30; // refresh product list every 30s

export default async function HomePage() {
  let products: Product[] = [];
  let error = false;

  try {
    products = await getProducts();
  } catch {
    error = true;
    products = [];
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/admin/login" className="flex items-center gap-3 group">
            <Image
              src="/WhatsApp Image 2026-07-24 at 20.46.16.jpeg"
              alt="Mystique World logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <h1 className="text-xl font-semibold group-hover:opacity-80 transition-opacity">
              Mystique World
            </h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-1">Our Products</h2>
        <p className="text-muted-foreground mb-6">
          Browse and order directly on WhatsApp.
        </p>

        {error && (
          <p className="text-destructive">
            Couldn&apos;t load products right now. Please try again shortly.
          </p>
        )}

        {!error && products.length === 0 && (
          <p className="text-muted-foreground">No products yet — check back soon!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}