export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  badge?: string;
  materials: string[];
  swatches: { name: string; color: string }[];
  quickLookImages: string[];
  dimensions: string;
};
