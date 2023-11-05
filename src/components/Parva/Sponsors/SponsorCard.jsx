import React from 'react'

const SponsorCard = ({ sponsor }) => {
    return (
        <a
            className="sponsor-card"
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div
                className="d-flex justify-content-center align-items-center m-6 p-6"
            >
                <img
                    loading="lazy"
                    src={sponsor.image}
                    style={{ scale: "1.5" }}
                    alt={sponsor.name}
                    data-aos="zoom-in"
                    className="aos-init aos-animate"
                    height="150px"
                />
            </div>
            <div className="sponsor-content">
                <h4 className="gold-txt m-0">{sponsor.name}</h4>
                <small className="white-txt">{sponsor.title}</small>
            </div>
        </a>
    )
}

export default SponsorCard
