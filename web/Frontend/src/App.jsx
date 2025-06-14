import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { loadUser } from './actions/userActions.js';
import { useSelector } from 'react-redux';
import { persistReduxStore } from './store.js'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBotButton from "./components/ChatBotButton.jsx";
import Landing from "./pages/Landing.jsx";
import LoginSignup from "./components/User/LoginSignup.jsx";
import Profile from "./components/User/Profile.jsx";
 

function App() {
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    persistReduxStore.dispatch(loadUser());
  }, []);

  return (
    <div className="flex items-center flex-col">
      <Navbar />
      <div className="pt-20 w-full">
        <Routes>
          <Route path='/' element={<Landing />}></Route>
          <Route exact path='/login' element={<LoginSignup />} />
          <Route exact path='/account' element={<Profile user={user} />} />
        </Routes>
        <Footer />
        <ChatBotButton/>
      </div>
    </div>
  );
}

export default App;