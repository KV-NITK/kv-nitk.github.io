import React from 'react'
import "./Contact.css"
import Metadata from '../MetaData/MetaData'

const Contact = () => {
    return (
        <>
            <Metadata title="Contact | Kannada Vedike" />
            <div className="section mb-4">
                <h2 className="text-center font-weight-bold primary-text-clr title pt-5">
                    Contact Us
                </h2>
                <div className="container mt-4">
                    <div className="section">
                        <div className="row">
                            <div className="footer-col col-4 contact-card">
                                <h3>Dr.Kiran M </h3>
                                <div>Faculty Advisor</div>
                                <div>+91 8242473561 </div>
                                <div>kiranmanjappa@nitk.edu.in</div>
                            </div>
                            <div className="footer-col col-4 contact-card">
                                <h3>Sumukh S K</h3>
                                <div>Convenor</div>
                                <div>+91 94812 46683</div>
                                <div>sksumukha.211ee153@nitk.edu.in</div>
                            </div>
                            <div className="footer-col col-4 contact-card">
                                <h3>Gururaj Mahadev Madannavar</h3>
                                <div>Marketing Head</div>
                                <div>+91 8310326367</div>
                                <div>gururajmahadevmadannavar.211ec115@nitk.edu.in</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contact
