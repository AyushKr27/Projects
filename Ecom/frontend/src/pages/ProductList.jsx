import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
// import { fetchProducts } from "../store/slices/productSlice.js";
import { fetchProducts } from "../store/slices/productSlice";

export default function ProductList() {
  const dispatch = useDispatch();
  const { products, total, page, pages } = useSelector((s) => s.products);
  const [params, setParams] = useState({ page: 1, limit: 12, sort: "latest" });

  useEffect(() => { dispatch(fetchProducts(params)); }, [dispatch, params]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <select className="border px-3 py-1 rounded" value={params.sort} onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value }))}>
          <option value="latest">Latest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        <button className="px-3 py-1 border rounded" disabled={params.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}>Prev</button>
        <div className="px-3 py-1 border rounded">Page {params.page}</div>
        <button className="px-3 py-1 border rounded" disabled={params.page >= pages} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}>Next</button>
      </div>
    </div>
  );
}
