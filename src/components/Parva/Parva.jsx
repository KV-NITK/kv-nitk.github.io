import { parva } from "../../data/data";
import Metadata from "../MetaData/MetaData";
import Brochure from "./Brochure/Brochure";
import "./Parva.css";
import Sponsors from "./Sponsors/Sponsors";
import Timeline from "./Timeline/Timeline";

const Parva = () => {
    return (
        <>
            <Metadata title={"Parva-24 | Kannada Vedike NITK"} />
            <main className="parva">
                <div className="parva-main">
                    <div className="logo">
                        <img src={parva.logo} alt="" />
                    </div>
                    <div className="parva-content">
                        <h1>Parva-24</h1>
                        <p>
                            From 5-10 November
                        </p>
                    </div>
                </div>
                <div id="parva-about" className="parva-section">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-12 col-lg-7 offset-lg-1 order-lg-last d-flex justify-content-center align-items-center">
                                <div className="nav-link">
                                    <img
                                        loading="lazy"
                                        src={parva.aboutImg}
                                        onerror="this.onerror=null;this.src='./image/parva/logo.png';"
                                        width="100%"
                                        style={{ position: "relative" }}
                                        alt="Parva"
                                        data-aos="fade-up"
                                    />
                                </div>
                            </div>
                            <div
                                className="col-12 col-lg-4 order-lg-first about aos-init aos-animate"
                                data-aos="fade-up"
                            >
                                <h2 className="white-txt">
                                    <span className="gold-txt">Discover Parva 2024:</span> Celebrating Karnataka's Rich Cultural Heritage
                                </h2>
                                <br />
                                <p className="lead" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Join us for Parva 2024: A grand celebration by NITK Kannada Vedike, paying homage to the 68th Kannada Rajyotsava and the 51st anniversary of Karnataka's renaming. It's more than a festival; it's a vibrant tribute to language, art, and culture. Since 1960, Parva has grown into a magnificent cultural extravaganza, and this year, we're making it even bigger and better. Come celebrate Karnataka's diverse traditions, art, and linguistic splendor with us. Experience an enriching tapestry of music, dance, and festivities, showcasing the essence of Karnataka.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Brochure />
                <Timeline />
                <Sponsors />
            </main>
        </>
    )
}

export default Parva
