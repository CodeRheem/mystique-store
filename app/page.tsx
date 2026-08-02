import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { Menu02Icon } from "hugeicons-react";
import { Stalemate } from "next/font/google";

const stalemate = Stalemate({
  subsets: ["latin"],
  weight: "400",
});

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
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex w-full items-center justify-between">
            {/* Left */}
            <Link href="/admin/login">
              <Image
                src="/logo.jpeg"
                alt="Mystique World logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>

            {/* Center */}
            <h1 className={`${stalemate.className} text-5xl flex-1 text-center font-bold text-primary`}>
              Mystique World
            </h1>

            {/* Right */}
            <Menu02Icon className="h-6 w-6" />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <h2 className="text-2xl font-bold mb-1">
          La <span className="text-primary underline">boutique.</span>
        </h2>
        <p className="text-muted-foreground mb-6">
          Take your order to the next level with our exlusive products.
        </p>

        {error && (
          <p className="text-destructive">
            Couldn&apos;t load products right now. Please try again shortly.
          </p>
        )}

        {!error && products.length === 0 && (
          <p className="text-muted-foreground">
            No products yet — check back soon!
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in duration-700"
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
    </main>
  );
}
