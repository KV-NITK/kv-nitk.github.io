import { Routes, Route, BrowserRouter as Router, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

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
import MerchTest from './components/merch-test/MerchTest';
import PaymentStatus from './components/merch-test/PaymentStatus';
import MyOrders from './components/merch-test/MyOrders';
import AdminOrders from './components/admin/AdminOrders';
import TeamRegistration from './components/team-registration/TeamRegistration';
import HH2026 from './components/HH2026/HH2026';
import HH2026Stats from './components/HH2026/HH2026Stats';
import ListOfMembers from './components/list-of-members/ListOfMembers';
import GameDashboard from './components/HH2026/GameDashboard';

import HH2026Leaderboard from './components/HH2026/leaderboard';
import HH2026QrScanner from './components/HH2026/qr-scanner';
import Feedback from './components/feedback/Feedback';
import FeedbackResponses from './components/feedback-responses/FeedbackResponses';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { UmamiTracker } from './components/analytics/UmamiTracker';

// Loaded on its own, so these don't pull in the rest of the site's code
// and the rest of the site doesn't pull in their fonts and effects.
// The /parva-26 landing page itself stays unrouted until it is released.
const Parva26Market = lazy(() => import('./components/Parva26/market/Market'));
const Parva26Merch = lazy(() => import('./components/Parva26/merch/Merch'));

// Standalone microsite routes render their own header/footer instead of the
// main site's chrome.
const STANDALONE_ROUTES = ['/analytics', '/hh-2026', '/hh-2026/play', '/hh-2026/dashboard', '/hh-2026/leaderboard', '/team-registration', '/list-of-members', '/hh-2026/qr-scanner', '/feedback', '/feedback-responses', '/feedback/responses', '/parva-26/market', '/parva-26/merch', '/merch-test', '/payment/status', '/my-orders', '/admin'];

function AppRoutes() {
  const location = useLocation();
  const isStandalone = STANDALONE_ROUTES.some((r) => location.pathname.startsWith(r));

  return (
    <>
      <UmamiTracker />
      {isStandalone ? null : <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/social" element={<Social />} />
        <Route path="/parva" element={<Parva25 />} />
        <Route path="/parva-23" element={<Parva />} />
        <Route path="/parva-26/market" element={<Suspense fallback={<div className="min-h-screen bg-[#0b0705]" />}><Parva26Market /></Suspense>} />
        <Route path="/parva-26/merch" element={<Suspense fallback={<div className="min-h-screen bg-[#0b0705]" />}><Parva26Merch /></Suspense>} />
        <Route path="/Merch" element={<Merch />} />
        <Route path="/merch-test" element={<MerchTest />} />
        <Route path="/payment/status" element={<PaymentStatus />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<AdminOrders />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/team-registration" element={<TeamRegistration />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feedback-responses" element={<FeedbackResponses />} />
        <Route path="/feedback/responses" element={<FeedbackResponses />} />
        <Route path="/hh-2026/stats" element={<HH2026Stats />} />
        <Route path="/list-of-members" element={<ListOfMembers />} />
        <Route path="/hh-2026" element={<HH2026 />} />
        <Route path="/hh-2026/leaderboard" element={<HH2026Leaderboard />} />
        <Route path="/hh-2026/play" element={<GameDashboard />} />
        <Route path="/hh-2026/dashboard" element={<GameDashboard />} />
        <Route path="/hh-2026/qr-scanner" element={<HH2026QrScanner />} />
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
