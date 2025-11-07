export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-bold">E-Comm</h1>
        <ul className="flex gap-6 font-medium">
          <li className="hover:underline cursor-pointer">Home</li>
          <li className="hover:underline cursor-pointer">Bag</li>
          <li className="hover:underline cursor-pointer">Sneakers</li>
          <li className="hover:underline cursor-pointer">Belt</li>
          <li className="hover:underline cursor-pointer">Contact</li>
        </ul>
      </div>
    </nav>
  );
}
