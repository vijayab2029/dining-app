import { Outlet } from "react-router";
import Navbar from "./Navbar";
import AuthModal from "./AuthModal";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import type { Session } from "@supabase/supabase-js";

function Layout() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <Navbar session={session} onSignInClick={() => setShowAuthModal(true)} />
      <Outlet context={{session}}/>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default Layout;