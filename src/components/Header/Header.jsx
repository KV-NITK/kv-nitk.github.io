import React, { useState } from 'react';
import logo from '../../images/logo.jpg';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X, Instagram } from 'lucide-react';
import { EVENT } from '../Parva26/content/event';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* --- Top Utility Bar --- */}
      <div className="flex items-center justify-between bg-black px-4 py-2 text-xs text-white sm:px-6">
        <div className="flex items-center gap-2 font-serif tracking-widest text-[#FFDA1D] uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-[#f21d2f] animate-pulse" />
          ಕನ್ನಡ ವೇದಿಕೆ NITK
        </div>
        <Link
          to="/parva-26"
          className="hidden sm:inline-flex items-center gap-2 font-serif tracking-wide text-[#f7eed6] transition-colors hover:text-[#FFDA1D]"
        >
          <span className="font-bold text-[#FFDA1D]">ಪರ್ವ 2026</span>
          <span className="text-white/60">·</span>
          {EVENT.dateEn}
          <span className="font-bold underline underline-offset-4">Explore →</span>
        </Link>
        <div className="ml-auto sm:ml-0">
          <a
            href="https://www.instagram.com/kannadavedike_nitk/"
            rel="noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FFDA1D] px-3.5 py-1 text-xs font-bold text-black transition-all hover:bg-yellow-400 hover:scale-105 shadow-sm"
          >
            <Instagram className="h-3.5 w-3.5" />
            Support Us
          </a>
        </div>
      </div>

      {/* --- Main Navbar --- */}
      <div className="relative border-b-2 border-[#d4af37]/30 bg-[#FFDA1D] px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo & Brand Name */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-105"
          >
            <img
              id="logo"
              src={logo}
              alt="Kannada Vedike Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-black/20 shadow-md group-hover:border-black/50"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-black tracking-wide text-black leading-none">
                ಕನ್ನಡ ವೇದಿಕೆ
              </span>
              <span className="font-serif text-[0.65rem] font-bold tracking-widest text-black/70 uppercase mt-0.5">
                Kannada Vedike NITK
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-serif text-sm font-bold text-black">
            <Link
              to="/"
              className={`transition-colors hover:text-[#8b261b] ${
                location.pathname === '/' ? 'text-[#8b261b] underline decoration-2 underline-offset-8' : ''
              }`}
            >
              Home
            </Link>

            <HashLink
              smooth
              to="/#about"
              className="transition-colors hover:text-[#8b261b]"
            >
              About Us
            </HashLink>

            <Link
              to="/parva-26"
              className="rounded-md bg-black px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-[#FFDA1D] uppercase transition-all hover:bg-[#8b261b] hover:text-[#f7eed6] hover:shadow-md"
            >
              Parva 2026
            </Link>


          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-black hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/30 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-3 border-t border-black/15 pt-3 pb-4 space-y-2 animate-in slide-in-from-top duration-200">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block rounded-md px-4 py-2.5 font-serif text-base font-bold text-black transition-colors hover:bg-black/10 ${
                location.pathname === '/' ? 'bg-black/10 text-[#8b261b]' : ''
              }`}
            >
              Home
            </Link>

            <HashLink
              smooth
              to="/#about"
              onClick={closeMenu}
              className="block rounded-md px-4 py-2.5 font-serif text-base font-bold text-black transition-colors hover:bg-black/10"
            >
              About Us
            </HashLink>

            <Link
              to="/parva-26"
              onClick={closeMenu}
              className="block rounded-md bg-black px-4 py-3 font-serif text-base font-extrabold tracking-wider text-[#FFDA1D] uppercase transition-colors hover:bg-black/90"
            >
              Parva 2026 · {EVENT.dateEn}
            </Link>


          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
