import React from "react";
import "./merch.css";
import SplitText from "../splitText.jsx";
import merchshirt from '../../images/merch/dummy.png';

const Merch = ({
    as: Component = "button",
    className = "",
    color = "white",
    speed = "6s",
    thickness = 1,
    link = "https://tinyurl.com/Parva25-Merch",
    children,
    ...rest
}) => {
    const handleClick = () => {
        window.open(link, "_blank");
    };

    return (
        <div className="merch-container">
            {/* Heading */}
            <SplitText
                text="Parva Merch"
                tag="h1"
                className="merch-heading"
                splitType="chars"
                delay={100}
                duration={0.6}
                ease="power3.out"
            />
            {/* Merch Image */}
            <img
                src={merchshirt}
                alt="Parva Merch"
                className="merch-image"
            />

            {/* Merch Details */}
            <div className="merch-items">
                <p className="merch-description">
                    Represent the royal spirit of Karnataka with this year’s exclusive Parva merchandise! 👑💛❤
                </p>

                <div className="merch-offers">
                    <p>✨ <strong>Launch Offer:</strong></p>
                    <p>👕 1 Merch – ₹249</p>
                    <p>👕👕 Combo of 2 – just ₹459!</p>
                </div>

                <div className="merch-delivery">
                    <p>💥 <strong>Guaranteed Delivery Promise:</strong></p>
                    <p>
                        If we don’t deliver your merch on or before <strong>Nov 1</strong>, your money will be refunded — no questions asked. ✅
                    </p>
                </div>

                <div className="merch-info">
                    <p>Limited stock • Royal design • Cultural pride</p>
                    <p>Deadline: <strong>22-10-2025</strong></p>
                    <p>For any queries, contact:</p>
                    <p>Srujan - 9108876997</p>
                    <p>Dhanaraj - 8431665282</p>
                </div>


            </div>

            {/* Shop Now Button */}
            <Component
                onClick={handleClick}
                className={`star-border-container ${className}`}
                style={{
                    padding: `${thickness}px 0`,
                    ...rest.style,
                }}
                {...rest}
            >
                <div
                    className="border-gradient-bottom"
                    style={{
                        background: `radial-gradient(circle, ${color}, transparent 10%)`,
                        animationDuration: speed,
                    }}
                ></div>
                <div
                    className="border-gradient-top"
                    style={{
                        background: `radial-gradient(circle, ${color}, transparent 10%)`,
                        animationDuration: speed,
                    }}
                ></div>
                <div className="inner-content">{children || "Shop Now"}</div>
            </Component>
        </div>
    );
};

export default Merch;
