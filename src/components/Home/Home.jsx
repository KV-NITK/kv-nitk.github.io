import React from 'react';
import imgSlider1 from '../../images/img-slider/imgSlider1.JPG';
import aboutImg1 from '../../images/aboutImg1.jpg';
import aboutImg2 from '../../images/aboutImg2.jpg';
import Metadata from '../MetaData/MetaData.jsx';

const Home = () => {

  return (
    <>
      {/* --- Metadata --- */}
      <Metadata title="Home | Kannada Vedike" />

      {/* --- Hero Image --- */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100vh - 130px)' }}
      >
        <img
          src={imgSlider1}
          className="w-full h-full object-cover"
          alt="Kannada Vedike"
        />

        {/* Hero Overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 bg-black/70 md:bg-black/85 px-4 py-6 md:py-4">
          <div className="text-center md:text-right text-xl md:text-2xl leading-[1.8] font-semibold text-[#f2b33d]">
            <p>ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರು ಇರು</p>
            <p>ಎಂದೆಂದಿಗು ನೀ ಕನ್ನಡವಾಗಿರು</p>
          </div>
          <div className="text-center text-[#f21d2f]">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
              <strong>ಕನ್ನಡ ವೇದಿಕೆ</strong>
            </h2>
            <p className="text-[#f2b33d] text-base md:text-lg font-semibold">
              ಇದು ಕನ್ನಡ ಅಭಿಮಾನಿ ಬಳಗ
            </p>
          </div>
        </div>
      </div>

      {/* --- About Section --- */}
      <div id="about" className="relative py-12 px-4 max-w-6xl mx-auto">
        {/* Background circle */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-w-full bg-[#f5f0e8] rounded-full -z-10" />

        <h2 className="mt-4 text-center text-foreground text-3xl md:text-4xl font-bold mb-8">
          About Us
        </h2>

        {/* Vision Card */}
        <div className="grid md:grid-cols-2 gap-6 items-center max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="order-2 md:order-1">
            <img className="w-full h-auto p-3" src={aboutImg2} alt="Vision" />
          </div>
          <div className="order-1 md:order-2 px-5 py-6 md:py-auto">
            <h2 className="text-[#f21d2f] text-2xl font-bold mb-4">OUR VISION</h2>
            <p className="text-[#444] text-left leading-[1.8]">
              By spreading Kannada's and Karnataka's culture and tradition across the institute,
              creating a platform for non-Kannadigas along with Kannadigas to learn the state's
              language, culture and tradition.
            </p>
          </div>
        </div>

        {/* Mission Card */}
        <div className="grid md:grid-cols-2 gap-6 items-center max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="order-1 px-5 py-6 md:py-auto">
            <h2 className="text-[#f21d2f] text-2xl font-bold mb-4">OUR MISSION</h2>
            <p className="text-[#444] text-left md:text-right leading-[1.8]">
              To encourage the usage of the state's language and culture in the institute.
              Emphasising the state's culture and tradition along with the technology.
            </p>
          </div>
          <div className="order-2">
            <img className="w-full h-auto p-3" src={aboutImg1} alt="Mission" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Home;