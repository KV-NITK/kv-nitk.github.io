import React from 'react'
import "./Contact.css"
import Metadata from '../MetaData/MetaData.jsx'

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
                                <h3>Yashas Gowda</h3>
                                <div>Convenor</div>
                                <div>+91 99013 55393</div>
                                <div>yashasgowdam0@gmail.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Contact
