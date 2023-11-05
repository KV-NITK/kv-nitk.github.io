import React from 'react'
import { parva } from '../../../data/data'
import SponsorCard from './SponsorCard'
import "./Sponsors.css"

const Sponsors = () => {
    return (
        <div className="sponsor" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="py-4 container">
                <h2 className="font-weight-bold white-txt" style={{ textAlign: "center" }}>
                    Our <span className="gold-txt">Sponsors </span>
                </h2>
                <div className="sponsor-container">
                    {parva.sponsors.map((sponsor) => <SponsorCard key={sponsor.name} sponsor={sponsor} />)}
                </div>
            </div>
        </div>
    )
}

export default Sponsors
