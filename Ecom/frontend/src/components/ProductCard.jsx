import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <Link to={`/products/${product._id}`}>
        <div className="h-40 bg-gray-50 flex items-center justify-center mb-3">
          <img src={product.images?.[0] || "https://via.placeholder.com/200"} alt={product.name} className="max-h-36" />
        </div>
      </Link>
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.category}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold">₹{product.price}</div>
        <Link to={`/products/${product._id}`} className="text-indigo-600 text-sm">View</Link>
      </div>
    </div>
  );
}
