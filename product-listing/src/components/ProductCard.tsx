import Image from "next/image";

type ProductProps = {
  product: {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    discount?: string;
    image: string;
  };
};

export default function ProductCard({ product }: ProductProps) {
  return (
    <div className="border rounded-lg p-3 relative bg-white">
      {/* HOT Tag */}
      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          HOT
        </span>
      )}

      {/* Image */}
      <div className="flex justify-center mb-3">
        <Image
          src={product.image}
          alt={product.name}
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* Name */}
      <h4 className="text-sm font-semibold mb-1">{product.name}</h4>

      {/* Prices */}
      <div className="flex gap-2 items-center">
        <span className="text-blue-600 font-bold">${product.price}</span>
        {product.oldPrice && (
          <span className="line-through text-gray-400 text-sm">
            ${product.oldPrice}
          </span>
        )}
        {product.discount && (
          <span className="text-red-500 text-xs">{product.discount} Off</span>
        )}
      </div>
    </div>
  );
}
