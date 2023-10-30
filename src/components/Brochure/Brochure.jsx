import React, { useState } from 'react';
import './Brochure.css';
import { brochureImage } from '../../data/data';

const Brochure = () => {
    const [imageSrc, setImageSrc] = useState(brochureImage[0]);

    const handleImageClick = (newSrc) => {
        setImageSrc(newSrc);
    };

    return (
        <div className="section brochure-container">
            <h2 className="text-center font-weight-bold primary-text-clr title pb-2"> Parva brochure</h2>
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
                                />
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Brochure;