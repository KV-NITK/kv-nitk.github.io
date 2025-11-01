import React from 'react';
import { Link } from 'react-router-dom';
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

      {/* --- Parva 2025 Banner --- */}
      <Link to="/parva" className="block relative w-full overflow-hidden group">
        <div
          className="relative w-full py-8 md:py-12 px-4 md:px-8"
          style={{
            background: 'linear-gradient(135deg, #FFDA1D 0%, #FFA500 25%, #f21d2f 75%, #C8102E 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease infinite'
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-3 drop-shadow-lg">
                ಪರ್ವ ೨೫
              </h2>
              <h3 className="text-xl md:text-3xl font-bold text-black/90 mb-4 drop-shadow-md">
                Parva 2025
              </h3>
              <p className="text-black/95 text-sm md:text-base leading-relaxed font-medium drop-shadow">
                Join us for Parva 2025: A grand celebration by NITK Kannada Vedike, paying homage to the 69th Kannada Rajyotsava and the 52nd anniversary of Karnataka's renaming. It's more than a festival; it's a vibrant tribute to language, art, and culture.
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 md:p-6 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>
      </Link>

      {/* --- About Section --- */}
      <div id="about" className="relative py-16 md:py-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(to bottom, #ffffff 0%, #fff9e6 30%, #ffffff 70%, #ffe6e6 100%)'
          }}
        />
        
        {/* Decorative elements */}
        <div className="hidden md:block absolute top-20 right-10 w-72 h-72 bg-linear-to-br from-[#FFDA1D]/20 to-transparent rounded-full blur-3xl -z-10" />
        <div className="hidden md:block absolute bottom-20 left-10 w-96 h-96 bg-linear-to-tr from-[#f21d2f]/15 to-transparent rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-linear-to-r from-[#f21d2f] via-[#FFDA1D] to-[#f21d2f] bg-clip-text text-transparent">
              About Us
            </h2>
            <div className="w-24 h-1 bg-linear-to-r from-[#FFDA1D] to-[#f21d2f] mx-auto rounded-full"></div>
          </div>

          {/* Vision Card */}
          <div className="mb-12 md:mb-16">
            <div className="grid md:grid-cols-2 gap-0 items-center max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white transform hover:scale-[1.01] transition-transform duration-300">
              <div className="order-2 md:order-1 relative overflow-hidden bg-linear-to-br from-[#FFDA1D]/10 to-[#f21d2f]/10">
                <div className="absolute inset-0 bg-black/5"></div>
                <img 
                  className="w-full h-full min-h-[300px] object-cover relative z-10" 
                  src={aboutImg2} 
                  alt="Vision" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10"></div>
              </div>
              <div className="order-1 md:order-2 px-6 md:px-8 py-8 md:py-12 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-12 bg-linear-to-b from-[#FFDA1D] to-[#f21d2f] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#f21d2f]">OUR VISION</h2>
                </div>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  By spreading Kannada's and Karnataka's culture and tradition across the institute,
                  creating a platform for non-Kannadigas along with Kannadigas to learn the state's
                  language, culture and tradition.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div>
            <div className="grid md:grid-cols-2 gap-0 items-center max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white transform hover:scale-[1.01] transition-transform duration-300">
              <div className="order-1 px-6 md:px-8 py-8 md:py-12 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-12 bg-linear-to-b from-[#FFDA1D] to-[#f21d2f] rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#f21d2f]">OUR MISSION</h2>
                </div>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  To encourage the usage of the state's language and culture in the institute.
                  Emphasising the state's culture and tradition along with the technology.
                </p>
              </div>
              <div className="order-2 relative overflow-hidden bg-linear-to-bl from-[#FFDA1D]/10 to-[#f21d2f]/10">
                <div className="absolute inset-0 bg-black/5"></div>
                <img 
                  className="w-full h-full min-h-[300px] object-cover relative z-10" 
                  src={aboutImg1} 
                  alt="Mission" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10"></div>
              </div>
            </div>
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
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default Home;