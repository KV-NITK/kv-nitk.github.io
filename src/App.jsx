import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

import './App.css';
import React from 'react';
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './components/Home/Home'
import Events from './components/Events/Events'
import Social from './components/Social/Social';
import Contact from './components/Contact/Contact';
import Brochure from './components/Parva/Brochure/Brochure';
import Parva from './components/Parva/Parva';
import Merch from './components/merch/merch';

function App() {
  useEffect(() => {
    const navlinks = Object.values(document.getElementsByClassName('all-nav-links'));
    navlinks.forEach((navlink) => {
      navlink.addEventListener("click", () => {
        document.documentElement.scrollTo(0, 0);
        document.getElementsByClassName("navbar-toggler-icon")[0].click();
      })
    })
  }, [])

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/social" element={<Social />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/parva" element={<Parva />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/Merch" element={<Merch />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
