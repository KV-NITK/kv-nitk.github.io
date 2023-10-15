import React from 'react'
import logo from '../../images/logo.jpg'
import '../Footer/Footer.css'
import facebookIcon from '../../icons/facebook.svg'
import instaIcon from '../../icons/insta.svg'
import twitterIcon from '../../icons/twitter.svg'
import { Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'

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
                                    The Kannada Vedike at NITK enhances the university's mission by showcasing Karnataka's unique culture through events, competitions, and workshops. Students are immersed in Karnataka's essence through festivals, language classes, and competitive displays.
                                </p>
                            </div>
                            <div className="footer-col col-4">
                                <h4>Contact Us</h4>
                                <ul>
                                    <li>
                                        <p>
                                            NH 66, Srinivasnagar
                                            <br /> Surathkal, Mangalore
                                            <br /> Karnataka 575025
                                        </p>
                                    </li>
                                    <li>
                                        <p>
                                            <a className="white-txt" href="mailto:kannadavedike@nitk.ac.in">
                                                kannadavedike@nitk.ac.in
                                            </a>
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <div className="footer-col col-4">
                                <h4>Quick Links</h4>
                                <ul>
                                    <li>
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li>
                                        <HashLink to="/#about">About Us</HashLink>
                                    </li>
                                    <li>
                                        <Link to="/events">Events</Link>
                                    </li>
                                    <li>
                                        <Link to="/social">Social Activities</Link>
                                    </li>
                                    <li>
                                        <Link to="/alumni">Alumni</Link>
                                    </li>
                                </ul>
                            </div>
                        </Row>
                    </div>
                </Container>
            </footer>
            <div id="lstFooter" className="flex notranslate">
                <div className="container section">
                    <div className="flex justify-content-between align-items-center m-4">
                        <span style={{ color: "#afafaf" }}>
                            Copyright All Rights Reserved 2021, Kannada Vedike
                        </span>
                        <span style={{ color: "#afafaf" }}>
                            <div class="social-links">
                                <a href="https://m.facebook.com/kannadavedikenitk/" target="_blank">
                                    <img src={facebookIcon} alt="" height="40" width="40" />
                                </a>
                                <a href="https://www.instagram.com/kannadavedike_nitk/" target="_blank">
                                    <img src={instaIcon} alt="" height="40" width="40" />
                                </a>
                                <a href="https://twitter.com/kv_nitk" target="_blank">
                                    <img src={twitterIcon} alt="" height="40" width="40" />
                                </a>
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Footer