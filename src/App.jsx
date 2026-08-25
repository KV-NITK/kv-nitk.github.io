import { Routes, Route, BrowserRouter as Router, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import './App.css';
import React from 'react';
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './components/Home/Home'
import Events from './components/Events/Events'
import Social from './components/Social/Social';
import Parva25 from './components/Parva25/Parva25';
import Parva from './components/Parva/Parva';
import Merch from './components/merch/merch';
import TeamRegistration from './components/team-registration/TeamRegistration';
import HH2026 from './components/HH2026/HH2026';
import ListOfMembers from './components/list-of-members/ListOfMembers';

import HH2026Leaderboard from './components/HH2026/leaderboard';

// Standalone microsite routes render their own header/footer instead of the
// main site's chrome.
const STANDALONE_ROUTES = ['/hh-2026', '/hh-2026/leaderboard', '/team-registration', '/list-of-members'];

function AppRoutes() {
  const location = useLocation();
  const isStandalone = STANDALONE_ROUTES.includes(location.pathname);

  return (
    <>
      {isStandalone ? null : <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/social" element={<Social />} />
        <Route path="/parva" element={<Parva25 />} />
        <Route path="/parva-23" element={<Parva />} />
        <Route path="/Merch" element={<Merch />} />
        <Route path="/team-registration" element={<TeamRegistration />} />
        <Route path="/list-of-members" element={<ListOfMembers />} />
        <Route path="/hh-2026" element={<HH2026 />} />
        <Route path="/hh-2026/leaderboard" element={<HH2026Leaderboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isStandalone ? null : <Footer />}
    </>
  );
}

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
      <AppRoutes />
    </Router>
  );
}

export default App;
