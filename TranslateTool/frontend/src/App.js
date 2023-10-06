import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage";
import { BrowserRouter as Router } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Authentication/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} exact></Route>
      <Route
        path="/chats"
        element={<ProtectedRoute page={<Mainpage />} />}
      ></Route>
      <Route
        path="/redirect"
        element={<ProtectedRoute page={<Mainpage />} />}
      ></Route>
    </Routes>
  );
}

export default App;
