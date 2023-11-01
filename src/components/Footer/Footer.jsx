import React from 'react'
import logo from '../../images/logo.jpg'
import '../Footer/Footer.css'
import { Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import { brochureLink } from '../../data/data'

const Footer = () => {
    return (
        <div id="footer">
            <footer className="footer notranslate">
                <Container>
                    <div className="section">
                        <Row>
                            <div className="footer-col col-4 first">
                                <div className="flex">
                                    <img
                                        src={logo}
                                        height={75}
                                        width={75}
                                        alt=""
                                        style={{ borderRadius: "100%" }}
                                    />
                                    <h4 className="white-txt my-auto ms-2 font-weight-bold">
                                        KANNADA VEDIKE
                                    </h4>
                                </div>
                                <p>
                                    The Kannada Vedike at NITK enhances the university's mission by showcasing Karnataka's unique culture through events, competitions, and workshops. Students are immersed in Karnataka's essence through festivals, language classes, and competitive displays.
                                </p>

                            </div>
                            <div className="footer-col col-4">
                                <h4>Social Links</h4>
                                <ul>
                                    <li>
                                        <a href="https://twitter.com/kv_nitk" target="_blank" rel="noopener noreferrer">
                                            Twitter
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://m.facebook.com/kannadavedikenitk/" target="_blank" rel="noopener noreferrer">
                                            Facebook
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.instagram.com/kannadavedike_nitk/" target="_blank" rel="noopener noreferrer">
                                            Instagram
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.linkedin.com/in/kannada-vedike-nitk-997574251/" target="_blank" rel="noopener noreferrer">
                                            LinkedIn
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="footer-col col-4">
                                <h4>Quick Links</h4>
                                <ul>
                                    <li className="all-nav-links">
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li className="all-nav-links">
                                        <HashLink to="/#about">About Us</HashLink>
                                    </li>
                                    <li className="all-nav-links">
                                        <Link to="/brochure">Brochure</Link>
                                        {/* <a href={brochureLink} target="_blank" rel="noreferrer">Brochure</a> */}
                                    </li>
                                    <li className="all-nav-links">
                                        <Link to="/events">Events</Link>
                                    </li>
                                    <li className="all-nav-links">
                                        <Link to="/social">Social Activities</Link>
                                    </li>
                                    <li className="all-nav-links">
                                        <Link to="/contact">Contact</Link>
                                    </li>
                                </ul>
                            </div>
                        </Row>
                    </div>
                </Container>
            </footer>
            <div id="lstFooter" className="notranslate flex justify-center items-center">
                <span id="top-btn" onClick={() => document.documentElement.scrollTo(0, 0)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" /></svg>
                </span>
                <div className="section flex">
                    <small style={{ color: "#afafaf" }} className="text-center">
                        Copyright All Rights Reserved {new Date().getFullYear()}, Kannada Vedike
                    </small>
                </div>
            </div>
        </div>

    )
}

export default Footer