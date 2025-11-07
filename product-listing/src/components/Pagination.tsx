"use client";

export default function Pagination() {
  return (
    <div className="flex justify-center mt-8 gap-2">
      {[1, 2, 3, 4, 5].map((page) => (
        <button
          key={page}
          className={`px-3 py-1 border rounded ${
            page === 3 ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
