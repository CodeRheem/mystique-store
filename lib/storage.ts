import { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  photo_url: string | null;
  options: string | null;
  quantity: number;
};

const FAVORITES_STORAGE_KEY = "mystique-favorites";
const CART_STORAGE_KEY = "mystique-cart";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readStorageValue<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const parsed = storage.getItem(key);
    return parsed ? (JSON.parse(parsed) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageValue<T>(key: string, value: T) {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(key, JSON.stringify(value));
}

function emitStorageUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("mystique-storage-updated"));
}

export function getFavoriteProductIds(): string[] {
  return readStorageValue<string[]>(FAVORITES_STORAGE_KEY, []);
}

export function toggleFavoriteProduct(productId: string): string[] {
  const favorites = getFavoriteProductIds();
  const nextFavorites = favorites.includes(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];

  writeStorageValue(FAVORITES_STORAGE_KEY, nextFavorites);
  emitStorageUpdate();
  return nextFavorites;
}

export function isFavoriteProduct(productId: string): boolean {
  return getFavoriteProductIds().includes(productId);
}

export function getFavoriteCount(): number {
  return getFavoriteProductIds().length;
}

export function getCartItems(): CartItem[] {
  return readStorageValue<CartItem[]>(CART_STORAGE_KEY, []);
}

export function isProductInCart(productId: string): boolean {
  return getCartItems().some((item) => item.productId === productId);
}

export function addProductToCart(product: Product, option?: string | null): CartItem[] {
  const items = getCartItems();
  const existingItem = items.find((item) => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
    if (option) existingItem.options = option;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      photo_url: product.photo_url,
      options: option ?? product.options ?? null,
      quantity: 1,
    });
  }

  writeStorageValue(CART_STORAGE_KEY, items);
  emitStorageUpdate();
  return items;
}

export function updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
  const items = getCartItems()
    .map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    )
    .filter((item) => item.quantity > 0);

  writeStorageValue(CART_STORAGE_KEY, items);
  emitStorageUpdate();
  return items;
}

export function removeCartItem(productId: string): CartItem[] {
  const items = getCartItems().filter((item) => item.productId !== productId);
  writeStorageValue(CART_STORAGE_KEY, items);
  emitStorageUpdate();
  return items;
}

export function clearCartItems(): CartItem[] {
  const items: CartItem[] = [];
  writeStorageValue(CART_STORAGE_KEY, items);
  emitStorageUpdate();
  return items;
}

export function getCartCount(): number {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
