import { Routes, Route, BrowserRouter as Router, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useLayoutEffect } from 'react';

import './App.css';
import React from 'react';
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './components/Home/Home'
import Events from './components/Events/Events'
import Social from './components/Social/Social';
import Alumni from './components/Alumni/Alumni';

function App() {
  const Wrapper = ({ children }) => {
    const location = useLocation();
    useLayoutEffect(() => {
      document.documentElement.scrollTo(0, 0);
      document.getElementsByClassName("navbar-toggler-icon")[0].click();
    }, [location.pathname]);
    return children
  }

  useEffect(() => {
    
  }, [])
  
  return (

    <Router>
      <Wrapper>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/social" element={<Social />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </Wrapper>
    </Router>
  );
}

export default App;
