import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login.jsx";
import Register from "./Pages/Register/Register.jsx";
import ProtectedRoutes from "./utils/ProtectedRoutes.jsx";
import Home from "./Pages/Home/Home.jsx";
import Status from "./Pages/Status/Status.jsx";
import AddDevice from "./Pages/AddDevice/AddDevice.jsx"; // New Add Device page
import Profile from "./Pages/Profile/Profile.jsx"; // Profile page
import History from "./Pages/History/History.jsx"; // History page
import System from "./Pages/System/System.jsx"; // LED Control page

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Status/>} />
          <Route path="/add" element={<AddDevice />} />
          <Route path="/system" element={<System />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
