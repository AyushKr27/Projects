import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/slices/productsSlice";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchProducts({ page: 1, limit: 8 })); }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
