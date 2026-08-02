import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { Libertinus_Serif } from "next/font/google";
import { Stalemate } from "next/font/google";
import { FavouriteIcon } from "hugeicons-react";
import { ShoppingCart02Icon } from "hugeicons-react";
import ProductSearch from "@/components/ProductSearch";

const libertinusSerif = Libertinus_Serif({
  subsets: ["latin"],
  weight: "400",
});

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
            <h1
              className={`${stalemate.className} text-2xl flex-1 text-center font-bold text-primary`}
            >
              Mystique World
            </h1>

            {/* Right */}
            <div className="flex items-center space-x-6">
              <Link href="/favorites">
                <FavouriteIcon className="h-6 w-6 text-primary" />
              </Link>
              <Link href="/cart">
                <ShoppingCart02Icon className="h-6 w-6 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </header>

    
      <div className="max-w-5xl mx-auto px-4">
        <section className="py-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="border border-white-900 rounded-3xl p-2 -mt-4">
            <h2
              className={`${libertinusSerif.className} text-3xl font-bold text-primary`}
            >
              Welcome,
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              ...Mystify your senses. Define your style.
            </p>
            <ProductSearch products={products} />
          </div>
        </section>

        <section className="-my-3 py-8 animate-in fade-in slide-in-from-bottom-2 duration-700 border border-white-900 rounded-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center px-4">
            {error && (
              <p className="text-destructive">
                Couldn&apos;t load products right now. Please try again shortly.
              </p>
            )}

            {!error && products.length === 0 && (
              <p className="text-muted-foreground text-center">
                No products yet — check back soon!
              </p>
            )}
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
      </div>
    </main>
  );
}