export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <p className="text-sm">© {new Date().getFullYear()} E-Comm. All rights reserved.</p>
        <ul className="flex gap-4 text-sm">
          <li className="hover:text-white cursor-pointer">Privacy</li>
          <li className="hover:text-white cursor-pointer">Terms</li>
          <li className="hover:text-white cursor-pointer">Help</li>
        </ul>
      </div>
    </footer>
  );
}
