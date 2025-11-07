export type Product = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  ratingValue: number;
  ratingCount: number;
  isHot?: boolean;
  colors: string[];
  category: string;
  imageUrl: string;
};

const placeholder = (i: number) => `https://via.placeholder.com/520x380.png?text=Product+${i}`;

export const PRODUCTS: Product[] = Array.from({length:24}).map((_, i) => {
  const id = `${i+1}`;
  const price = Math.round(100 + Math.random()*400);
  const discountPercent = Math.random() > 0.5 ? Math.floor(10 + Math.random()*50) : 0;
  const discountPrice = discountPercent ? Math.round(price * (1 - discountPercent/100)) : undefined;
  const colors = (["#1f2937","#ef4444","#f59e0b","#06b6d4","#10b981"]).slice(0, 3 + (i%3)).map((c, idx)=> c);
  return {
    id,
    name: `Nike Air Max ${270 + i}`,
    price,
    discountPrice,
    discountPercent,
    ratingValue: +(3 + Math.random()*2).toFixed(1),
    ratingCount: Math.floor(5 + Math.random()*500),
    isHot: Math.random() > 0.7,
    colors,
    category: ["Men","Women","Kids"][i%3],
    imageUrl: placeholder(i+1)
  };
});