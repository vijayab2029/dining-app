import {Routes, Route} from "react-router"
import Landing from "./pages/Landing"
import Menu from "./pages/Menu"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element = {<Layout />}>
        <Route path = "/" element = {<Landing/>} />
        <Route path = "/menu" element = {<Menu />} />
        <Route element={<ProtectedRoute/>}>
          <Route path = "/dashboard" element = {<Dashboard />} />
          <Route path = "/settings" element = {<Settings />} />
        </Route>
        </Route>
    </Routes>
  )
}

export default App