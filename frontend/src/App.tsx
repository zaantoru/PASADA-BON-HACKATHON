import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import FacilityMap from "./features/Map";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/facilities" element={<FacilityMap/>} />
      </Routes>
  </BrowserRouter>
  )
}

export default App
