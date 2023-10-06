import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage.js";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} exact></Route>
        <Route path="/chats" element={<Mainpage />}></Route>
      </Routes>
    </div>
  );
}

export default App;
