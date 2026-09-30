import { useState } from "react";
import { Link } from "react-router";
import { Lock, Settings } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

interface NavbarProps {
  onSignInClick: () => void;
  session: Session | null;
}

function Navbar({ onSignInClick, session }: NavbarProps) {
  const [lockedFeature, setLockedFeature] = useState<"dashboard" | "settings" | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
          {session ? (
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-900">
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => setLockedFeature("dashboard")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <Lock className="h-3.5 w-3.5" />
              Dashboard
            </button>
          )}
          {session ? (
            <Link
              to="/settings"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          ) : (
            <button
              onClick={() => setLockedFeature("settings")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900"
            >
              <span className="relative">
                <Settings className="h-4 w-4" />
                <Lock className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5" />
              </span>
              Settings
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-gray-500 text-sm">{session.user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={onSignInClick}
            className="group relative bg-green-600 text-white px-4 py-2 rounded-md overflow-hidden"
          >
            <span className="absolute inset-0 bg-green-700 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-600"></span>
            <span className="relative z-10">Sign In</span>
          </button>
        )}
      </div>

      {lockedFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setLockedFeature(null)}
              className="absolute top-4 right-4 text-gray-500"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {lockedFeature === "dashboard"
                ? "Sign in to view your dashboard"
                : "Sign in to manage your settings"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {lockedFeature === "dashboard"
                ? "Create an account or sign in to track your meals and see your nutrient totals."
                : "Create an account or sign in to save your allergens and dietary preferences."}
            </p>
            <button
              onClick={() => {
                setLockedFeature(null);
                onSignInClick();
              }}
              className="w-full bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors duration-150"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
