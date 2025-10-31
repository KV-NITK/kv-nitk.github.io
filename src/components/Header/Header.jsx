import React from 'react';
import '../Header/Header.css'
import langIcon from '../../icons/language.svg'
import logo from '../../images/logo.jpg'
// Removed react-bootstrap
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';
import { brochureLink } from '../../data/data';

const Header = () => {
    return (
        <>
            <div className="header flex px-3 w-100">
                <div className="flex languageSection">
                    {/* <img className="m-auto" width="20" height="20" src={langIcon} alt="" />
                    <div id="language" className="m-auto ps-1 notranslate btn">
                        ಕನ್ನಡ
                    </div> */}
                </div>
                <div className="support me-5 py-2 px-4 red-bg white-txt">
                    <a href="https://www.instagram.com/kannadavedike_nitk/" rel="noreferrer" target="_blank">
                        Support Us
                    </a>
                </div>
            </div>
            <div className="w-100 navbar">
                <div className="px-3 flex items-center justify-between w-100">
                    <Link to="/"> <img
                        id="logo"
                        src={logo}
                        alt=""
                        width="100"
                        height="100"
                    /></Link>
                    <nav className="ms-auto my-2 my-lg-0 flex gap-4">
                        <Link className="nav-link all-nav-links" to="/">Home</Link>
                        <HashLink smooth className="nav-link all-nav-links" to="/#about">About Us</HashLink>
                        {/* <a className="nav-link all-nav-links" href={brochureLink} target="_blank" rel="noreferrer">Brochure</a> */}
                        <Link className="nav-link all-nav-links" to="/parva">Parva</Link>
                        <Link className="nav-link all-nav-links" to="/events">Events</Link>
                        <Link className="nav-link all-nav-links" to="/social">Social Activities</Link>
                        <Link className="nav-link all-nav-links" to="/contact">Contact</Link>
                        <Link className="nav-link all-nav-links" to="/merch">Merch</Link>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Header
