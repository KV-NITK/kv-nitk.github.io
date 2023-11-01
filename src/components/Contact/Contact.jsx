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
                                <h3>Raviraj H.M</h3>
                                <div>Faculty Advisor</div>
                                <div>+91 9448861733</div>
                                <div>ravirajmh@nitk.edu.in</div>
                            </div>
                            <div className="footer-col col-4 contact-card">
                                <h3>Arun Hasabi</h3>
                                <div>Convenor</div>
                                <div>+91 6362679623</div>
                                <div>arunhasabi.201me308@nitk.edu.in</div>
                            </div>
                            <div className="footer-col col-4 contact-card">
                                <h3>Chinmay Kadole</h3>
                                <div>Marketing Head</div>
                                <div>+91 9986130382</div>
                                <div>chinpgkadole.201me315@nitk.edu.in</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contact
