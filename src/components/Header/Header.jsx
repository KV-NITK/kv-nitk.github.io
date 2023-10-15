import React from 'react';
import '../Header/Header.css'
import langIcon from '../../icons/language.svg'
import logo from '../../images/logo.jpg'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';

const Header = () => {
    return (
        <>
            <Container fluid md={3} className="header flex px-3 w-100">
                <div className="flex languageSection">
                    <img className="m-auto" width="20" height="20" src={langIcon} alt="" />
                    <div id="language" className="m-auto ps-1 notranslate btn">
                        ಕನ್ನಡ
                    </div>
                </div>
                <div className="support me-5 py-2 px-4 red-bg white-txt"><a href="#">Support Us</a></div>
            </Container>
            <Navbar expand="lg" variant="dark" className="w-100">
                <Container fluid>
                    <Link to="/"> <img
                        id="logo"
                        src={logo}
                        alt=""
                        width="100"
                        height="100"
                    /></Link>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="ms-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Link className="nav-link" to="/">Home</Link>
                            <HashLink smooth className="nav-link" to="/#about">About Us</HashLink>
                            <Link className="nav-link" to="/events">Events</Link>
                            <Link className="nav-link" to="/social">Social Activities</Link>
                            <Link className="nav-link" to="/alumni">Alumni</Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default Header
