import React, { useEffect, useState } from 'react';
import './Brochure.css';
import { brochureImage } from '../../../data/data';

const Brochure = () => {
    const [imageSrc, setImageSrc] = useState(brochureImage[6]);

    const handleImageClick = (newSrc) => {
        setImageSrc(newSrc);
    };

    useEffect(() => {
        handleImageClick(brochureImage[0]);
    }, []);


    return (
        <>
            <div id="brochure" className="brochure-container">
                <div className="section">
                    <h2 className="white-txt font-weight-bold heading-text mb-4" style={{ textAlign: "center" }}>
                        <span className="gold-txt">Parva</span> {" "} Brochure
                    </h2>
                    <div className="gallery">
                        <div className="hero">
                            <img src={imageSrc} alt="brochure img" />
                        </div>
                        <div className="btn-container">
                            <ul className="btns">
                                {brochureImage.map((image) =>
                                    <li key={image}>
                                        <img
                                            src={image}
                                            alt="brochure img"
                                            onClick={() => handleImageClick(image)}
                                            className={image === imageSrc ? 'active-image' : ''}
                                        />
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Brochure;