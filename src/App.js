import './App.css';
import React from 'react';
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './components/Home/Home'
import Events from './components/Events/Events'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Social from './components/Social/Social';
import Alumni from './components/Alumni/Alumni';

function App() {

  // translator button functions here  
  function googleTranslateElementInit() {
  }

  return (

    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/social" element={<Social />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
