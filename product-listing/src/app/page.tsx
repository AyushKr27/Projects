import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { PRODUCTS } from "@/data/products";

export default function ProductPage() {
  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <Sidebar />

      {/* Product Section */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">{PRODUCTS.length} Items</p>
          <div className="flex gap-3 text-sm">
            <select className="border rounded p-1">
              <option>Sort by</option>
              <option>Name</option>
              <option>Price</option>
            </select>
            <select className="border rounded p-1">
              <option>Show 6</option>
              <option>Show 12</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination />
      </div>
    </div>
  );
}
