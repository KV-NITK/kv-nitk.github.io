import React, { useEffect } from 'react';
import '../Header/Header.css'
import langIcon from '../../icons/language.svg'
import logo from '../../images/logo.jpg'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Header = () => {

    useEffect(() => {
        window.addEventListener("scroll", (e) => {
            var navbar = document.getElementsByTagName("nav")[0];
            var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            if (scrollTop >= 50) {
                navbar.classList.add("scroll");
            } else {
                navbar.classList.remove("scroll");
            }
        })
    }, [])

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
                            <a className="nav-link" href="/#about">About Us</a>
                            <Link className="nav-link" to="/events">Events</Link>
                            <Link className="nav-link" to="/social">Social Activities</Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>

    )
}

export default Header
