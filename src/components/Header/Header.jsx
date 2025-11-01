import React from 'react';
import langIcon from '../../icons/language.svg'
import logo from '../../images/logo.jpg'
// Removed react-bootstrap
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';
import { brochureLink } from '../../data/data';

const Header = () => {
    return (
        <>
            <div className="w-full flex items-center justify-between px-3 py-2 bg-black">
                <div className="flex items-center">
                    {/* <img className="m-auto" width="20" height="20" src={langIcon} alt="" />
                    <div id="language" className="m-auto ps-1 notranslate btn">
                        ಕನ್ನಡ
                    </div> */}
                </div>
                <div className="ml-auto mr-3">
                    <a
                        href="https://www.instagram.com/kannadavedike_nitk/"
                        rel="noreferrer"
                        target="_blank"
                        className="inline-flex items-center justify-center rounded-md bg-[#FFDA1D] text-black px-4 py-2 font-semibold hover:brightness-95 transition"
                    >
                        Support Us
                    </a>
                </div>
            </div>
            <div className="w-full border-t border-border bg-[#FFDA1D]">
                <div className="px-3 py-2 flex items-center justify-between w-full">
                    <Link to="/"> <img
                        id="logo"
                        src={logo}
                        alt=""
                        className="h-16 w-16 object-cover rounded-full"
                    /></Link>
                    <nav className="ml-auto flex items-center gap-4 text-sm md:text-base text-black mr-10">
                        <Link className="all-nav-links transition" to="/">Home</Link>
                        <HashLink smooth className="all-nav-links transition" to="/#about">About Us</HashLink>
                        {/* <a className="all-nav-links transition" href={brochureLink} target="_blank" rel="noreferrer">Brochure</a> */}
                        <Link className="all-nav-links transition" to="/parva">Parva</Link>
                        {/* <Link className="all-nav-links transition" to="/events">Events</Link> */}
                        {/* <Link className="all-nav-links transition" to="/social">Social Activities</Link> */}
                        {/* <Link className="all-nav-links transition" to="/merch">Merch</Link> */}
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Header
