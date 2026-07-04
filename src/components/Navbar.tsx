import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-gray-900">
          DineNEU
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/menu" className="text-gray-500 hover:text-gray-900">
            Menu
          </Link>
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-900">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex items-center">
        <button className="group relative bg-green-600 text-white px-4 py-2 rounded-md overflow-hidden">
          <span className="absolute inset-0 bg-green-700 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-600"></span>
          <span className="relative z-10">Sign In</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

