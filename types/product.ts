export type Product = {
  id: string
  name: string
  price: string
  image: string
  badge?: "New" | "Back in stock" | "Limited" | "Popular" | "Featured"
  materials: string[]
  swatches: { name: string; color: string }[]
  quickLookImages: string[]
  dimensions: string
}