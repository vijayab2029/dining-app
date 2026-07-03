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
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

