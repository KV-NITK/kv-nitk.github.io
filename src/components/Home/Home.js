import React from 'react'
import './Home.css'
import { Container, Carousel } from 'react-bootstrap'
import imgSlider1 from '../../images/img-slider/imgSlider1.JPG'
import imgSlider2 from '../../images/img-slider/imgSlider2.JPG'
import imgSlider3 from '../../images/img-slider/imgSlider3.JPG'
import aboutImg1 from '../../images/aboutImg1.jpg' 
import aboutImg2 from '../../images/aboutImg2.jpg' 
import Metadata from '../MetaData/MetaData'

const Home = () => {
    return (
        <>
            <Metadata title="Home | Kannada Vedike" />
            <Container fluid className="px-0" calssName="page">
                <Carousel>
                    <Carousel.Item>
                        <img src={imgSlider1} className="carousel-img" alt="carousel-img" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={imgSlider2} className="carousel-img" alt="carousel-img" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={imgSlider3} className="carousel-img" alt="carousel-img" />
                    </Carousel.Item>
                </Carousel>

                <div
                    id="hero"
                    className="container-fluid text-center px-0 notranslate aos-init aos-animate page"
                    data-aos="fade-up"
                    data-aos-offset={-20}
                >
                    <p className="hero left-hero">
                        ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರು ಇರು <br /> ಎಂದೆಂದಿಗು ನೀ ಕನ್ನಡವಾಗಿರು
                    </p>
                    <div className="hero right-hero">
                        <h2>
                            <strong id="kv"> ಕನ್ನಡ ವೇದಿಕೆ </strong>
                        </h2>
                        <p id="kv-sub">ಇದು ಕನ್ನಡ ಅಭಿಮಾನಿ ಬಳಗ</p>
                    </div>
                </div>
            </Container>

            <div id="about" className="section">
                <h2
                    className="mt-4 text-center black-txt title aos-init aos-animate"
                    data-aos="fade"
                >
                    About Us
                </h2>
                <div
                    className="about-card mx-auto my-4 aos-init aos-animate"
                    style={{ maxWidth: 1200 }}
                    data-aos="fade-right"
                >
                    <div className="about-img">
                        <img className="px-3 my-3" src={aboutImg2} alt="" width="100%" />
                    </div>
                    <span className="about-content px-5 py-auto" style={{ lineHeight: "1.8" }}>
                        <h2 className="font-weight-bold primary-text-clr">OUR VISION</h2>
                        <span style={{ color: "#444" }} className="text-left">
                            Preservation and Promotion of cultural significance of homeland,
                            emphasis on mutual respect and spreading sense of true unity in
                            diversity among the students of NITK
                        </span>
                    </span>
                </div>
                <br />
                <div
                    className="about-card mx-auto my-4 aos-init aos-animate"
                    style={{ maxWidth: 1200 }}
                    data-aos="fade-left"
                >
                    <span className="about-content px-5 py-auto" style={{ lineHeight: "1.8" }}>
                        <h2 className="font-weight-bold primary-text-clr">OUR MISSION</h2>
                        <span style={{ color: "#444" }} className="text-right">
                            Organising events, competitions, social activities to uphold team spirit
                            among students of different background.
                        </span>
                    </span>
                    <div className="about-img">
                        <img className="px-3 my-3" src={aboutImg1} alt="" width="100%" />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Home
