import Button from "./Button";

const Navbar = () => {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-sm"></div>
          <span className="text-lg font-semibold text-gray-900">
            Dinaaz Hair & Skin
          </span>
        </div>

        {/* CTA Button */}
        <Button>
          Book A Consultation ↗
        </Button>

      </div>
    </header>
  );
};

export default Navbar;
