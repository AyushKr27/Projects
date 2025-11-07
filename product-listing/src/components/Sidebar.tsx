"use client";

import { useState } from "react";

export default function Sidebar() {
  const [price, setPrice] = useState([10, 50]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const hotDeals = [
    { name: "Nike", count: 2 },
    { name: "Airmax", count: 48 },
    { name: "Adidas", count: 95 },
    { name: "Vans", count: 23 },
    { name: "All Stars", count: 45 },
  ];

  const colors = ["#000000", "#ff0000", "#0000ff", "#ffff00", "#ff00ff", "#00ff00"];

  const brands = [
    { name: "Nike", count: 99 },
    { name: "Adidas", count: 99 },
    { name: "Siemens", count: 99 },
  ];

  return (
    <aside className="border rounded-lg p-4 bg-white w-64">
      {/* Hot Deals */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Hot Deals</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {hotDeals.map((deal) => (
            <li
              key={deal.name}
              className="flex justify-between cursor-pointer hover:text-blue-600"
            >
              <span>{deal.name}</span>
              <span className="text-gray-500">{deal.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Prices</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={price[1]}
          onChange={(e) => setPrice([price[0], parseInt(e.target.value)])}
          className="w-full"
        />
        <p className="text-sm text-gray-600">
          Range: ${price[0]} - ${price[1]}
        </p>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Color</h3>
        <div className="flex gap-2">
          {colors.map((c) => (
            <span
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full cursor-pointer border ${
                selectedColor === c ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c }}
            ></span>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Brand</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {brands.map((brand) => (
            <li
              key={brand.name}
              className={`flex justify-between cursor-pointer hover:text-blue-600 ${
                selectedBrand === brand.name ? "font-bold text-blue-600" : ""
              }`}
              onClick={() => setSelectedBrand(brand.name)}
            >
              <span>{brand.name}</span>
              <span className="text-gray-500">{brand.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* More Button */}
      <button className="w-full py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100">
        More
      </button>
    </aside>
  );
}
