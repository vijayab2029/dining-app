import { Navigate, Outlet, useOutletContext } from "react-router";
import type { Session } from "@supabase/supabase-js";

function ProtectedRoute() {
    const {session} = useOutletContext<{session: Session | null}>()

    if (!session) {
        return <Navigate to="/" replace/>
    }

    return <Outlet context={{session}}/>
}

export default ProtectedRoute