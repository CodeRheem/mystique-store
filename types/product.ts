export interface Product {
  id: string;
  name: string;
  price: number;
  photo_url: string | null;
  options: string | null;
  is_sold_out: boolean;
  is_new: boolean;
  created_at: string;
}