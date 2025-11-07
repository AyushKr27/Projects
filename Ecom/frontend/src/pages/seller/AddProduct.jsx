import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [images, setImages] = useState([]); // store Cloudinary URLs
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 📸 Upload multiple images to Cloudinary
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
        formData.append("upload_preset", "Ecommerce"); // ⚙️ Replace with Cloudinary preset

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

  // 🗑️ Remove an image from preview
  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  // 🧾 Submit product form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("sellerToken");
      if (images.length === 0) {
        setMessage("⚠️ Please upload at least one image.");
        return;
      }

      const productData = {
        ...form,
        images,
      };

      await axios.post("http://localhost:5000/api/seller/products/add", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Product added successfully!");
      setTimeout(() => navigate("/seller/my-products"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add product.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-[440px]">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit}>
          {["name", "description", "category", "price", "stock"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          ))}

          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Upload Product Images (max 5)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesUpload}
              disabled={uploading}
              className="w-full border p-2 rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {images.map((img) => (
                  <div
                    key={img}
                    className="relative group border rounded overflow-hidden"
                  >
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
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {uploading ? "Uploading..." : "Add Product"}
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

export default AddProduct;
