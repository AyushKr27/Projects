import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔄 Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        const res = await axios.get(`http://localhost:5000/api/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const product = res.data.product;
        setForm({
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
        });
        setImages(product.images || []);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to fetch product details");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 📸 Upload new images to Cloudinary
  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5)
      return setMessage("⚠️ You can upload a maximum of 5 images.");

    setUploading(true);
    setMessage("Uploading images...");

    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Ecommerce"); // replace with your Cloudinary preset

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dcjxojsha/image/upload",
          formData
        );
        uploaded.push(res.data.secure_url);
      }

      setImages((prev) => [...prev, ...uploaded]);
      setMessage("✅ Images uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Remove image from preview
  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  // 💾 Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("sellerToken");
      const productData = { ...form, images };

      await axios.put(
        `http://localhost:5000/api/seller/products/${id}/edit`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Product updated successfully!");
      setTimeout(() => navigate("/seller/my-products"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Update failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-[440px]">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit}>
          {["name", "description", "category", "price", "stock"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          ))}

          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Update Product Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesUpload}
              disabled={uploading}
              className="w-full border p-2 rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
            />

            {/* Preview Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {images.map((img) => (
                  <div key={img} className="relative group border rounded overflow-hidden">
                    <img
                      src={img}
                      alt="Preview"
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded text-white font-semibold ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "Uploading..." : "Save Changes"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("✅")
                ? "text-green-600"
                : message.includes("❌")
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default EditProduct;
