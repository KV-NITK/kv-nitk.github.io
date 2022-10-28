import React from 'react'
import logo from '../../images/logo.jpg'
import '../Footer/Footer.css'
import facebookIcon from '../../icons/facebook.svg'
import instaIcon from '../../icons/insta.svg'
import twitterIcon from '../../icons/twitter.svg'
import { Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <div id="footer">
            <footer className="footer notranslate">
                <Container>
                    <Row>
                        <div className="footer-col col-6 first">
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
                                Lorem ipsum dolor consectetur Ipsa tempore,blanditiis, inventore asperiores voluptatibus culpa sed debitis nesciunt voluptates fugiat fugit aliquam quis a reiciendis recusandae, nam deleniti tenetur repellendus eos totam. Exercitationem ea debitis autem.
                            </p>
                        </div>
                        <div className="footer-col col-3">
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
                                        <span className="white-txt"> 8989898989</span>
                                        <br />{" "}
                                        <a className="white-txt" href="mailto:kannadavedike@nitk.ac.in">
                                            kannadavedike@nitk.ac.in
                                        </a>
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="footer-col col-3">
                            <h4>Quick Links</h4>
                            <ul>
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <Link to="/#about">About Us</Link>
                                </li>
                                <li>
                                    <Link to="/events">Events</Link>
                                </li>
                                <li>
                                    <Link to="/social">Social Activities</Link>
                                </li>
                            </ul>
                        </div>

                    </Row>
                </Container>
            </footer>
            <div id="lstFooter" className="flex notranslate">
                <div className="container">
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