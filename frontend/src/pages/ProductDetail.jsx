import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useDispatch } from "react-redux";
import { addItem } from "../store/slices/cartSlice";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then((res) => setProduct(res.data)).catch(console.error);
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const handleAdd = () => {
    dispatch(addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty,
      image: product.images?.[0] || ""
    }));
    navigate("/cart");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-4 rounded shadow">
        <img src={product.images?.[0] || "https://via.placeholder.com/600"} alt={product.name} className="w-full max-h-96 object-contain" />
        <h2 className="text-xl font-bold mt-4">{product.name}</h2>
        <p className="text-gray-600 mt-2">{product.description}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="text-2xl font-bold">${product.price}</div>
        <div className="mt-4 flex items-center gap-2">
          <span>Qty:</span>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-20 border px-2 py-1 rounded" />
        </div>
        <button onClick={handleAdd} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded">Add to cart</button>
      </div>
    </div>
  );
}
