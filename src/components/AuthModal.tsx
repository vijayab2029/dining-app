import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../supabase";
import Modal from "./Modal";

interface AuthModalProps {
  onClose: () => void;
}

function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signIn") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onClose();
    } else {
      if (password !== confirmPassword) {
        setError("Password and confirmation password do not match")
        setLoading(false)
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
      else setSignUpSuccess(true);
    }

    setLoading(false);
  };

  const title = signUpSuccess
    ? "Check your email"
    : mode === "signIn"
      ? "Sign In"
      : "Sign Up";

  return (
    <Modal
      title={title}
      onClose={onClose}
      panelClassName="p-8 max-w-sm"
      titleClassName={`text-2xl font-bold text-gray-900 ${signUpSuccess ? "mb-4" : "mb-6"}`}
    >
      {signUpSuccess ? (
        <p className="text-gray-500 text-sm">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-200 rounded-md px-4 py-2"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-md px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 rounded-md"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === "signUp" && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-md px-4 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 rounded-md"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-red-600 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors duration-150"
            >
              {loading ? "Loading..." : mode === "signIn" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {mode === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
              className="text-green-600 font-medium rounded-sm"
            >
              {mode === "signIn" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </>
      )}
    </Modal>
  );
}

export default AuthModal;
