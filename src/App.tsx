import {Routes, Route} from "react-router"
import Landing from "./pages/Landing"
import Menu from "./pages/Menu"
import Dashboard from "./pages/Dashboard"
import Layout from "./components/Layout"

function App() {
  return (
    <Routes>
      <Route element = {<Layout />}>
        <Route path = "/" element = {<Landing/>} />
        <Route path = "/menu" element = {<Menu />} />
        <Route path = "/dashboard" element = {<Dashboard />} />
        </Route>
    </Routes>
  )
}

export default App