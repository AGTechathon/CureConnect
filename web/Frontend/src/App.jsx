import "./i18";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"
import { Routes, Route } from "react-router-dom";
import ChatBotButton from "./components/ChatBotButton.jsx";
import Landing from "./pages/Landing.jsx";
 

function App() {

  return (
    <div className="flex items-center flex-col">
      <Navbar />
      <div className="pt-20 w-full">
        <Routes>
          <Route path='/' element={<Landing />}></Route>
        </Routes>
        <Footer />
        <ChatBotButton/>
      </div>
    </div>
  );
}

export default App;