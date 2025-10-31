import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imgSlider1 from '../../images/img-slider/imgSlider1.JPG';
import imgSlider2 from '../../images/img-slider/imgSlider2.JPG';
import imgSlider3 from '../../images/img-slider/imgSlider3.JPG';
import imgSlider4 from '../../images/img-slider/aboutImg1.jpg';
import aboutImg1 from '../../images/aboutImg1.jpg';
import aboutImg2 from '../../images/aboutImg2.jpg';
import Metadata from '../MetaData/MetaData.jsx';
import merchShirt from '../../images/merch/dummy.png';

function AutoAdvance({ setCurrent, count, paused }) {
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, 5000); // Set to 5 seconds
    return () => clearInterval(id);
  }, [paused, count, setCurrent]);
  return null;
}

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = useMemo(() => [imgSlider1, imgSlider2, imgSlider3, imgSlider4], []);
  const navigate = useNavigate();

  // Function to move to the next slide
  const nextSlide = () => {
    setCurrent((c) => (c + 1) % slides.length);
    setPaused(false); // Un-pause when manually clicking
  };

  // Function to move to the previous slide
  const prevSlide = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
    setPaused(false); // Un-pause when manually clicking
  };

  // --- Swipe gesture handling ---
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide(); // Swipe left to go next
      else prevSlide(); // Swipe right to go previous
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      {/* --- Metadata --- */}
      <Metadata title="Home | Kannada Vedike" />

      {/* --- Hero Carousel --- */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100vh - 110px)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
            width: `${slides.length * 100}%`,
          }}
        >
          {slides.map((src, idx) => (
          
              <img
                src={src}
                // This comment is fine
                className="relative w-full h-auto object-cover"
                alt={`carousel-img-${idx + 1}`}
              />
            
          ))}
        </div>

        {/* ⬅️ LEFT ARROW BUTTON */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 
                     p-3 md:p-4 bg-black/40 hover:bg-black/60 rounded-full 
                     text-white transition-all focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* ➡️ RIGHT ARROW BUTTON */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 
                     p-3 md:p-4 bg-black/40 hover:bg-black/60 rounded-full 
                     text-white transition-all focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setPaused(false); // Un-pause on dot click
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${current === i
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/80'
                }`}
            />
          ))}
        </div>

        {/* Autoplay */}
        <AutoAdvance
          setCurrent={setCurrent}
          count={slides.length}
          paused={paused}
        />

        {/* Hero Overlay */}
        <div className="absolute md:relative bottom-0 left-0 right-0 grid md:grid-cols-2 grid-cols-1 min-h-[100px] bg-black/70 md:bg-black/85 px-4 py-2">
          <p className="hidden md:block text-right pr-4 text-xl leading-[1.8] font-semibold text-[#f2b33d] py-2">
            ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರು ಇರು <br /> ಎಂದೆಂದಿಗು ನೀ ಕನ್ನಡವಾಗಿರು
          </p>
          <div className="text-center md:text-left pl-4 md:pl-4 text-[#f21d2f] py-2">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
              <strong> ಕನ್ನಡ ವೇದಿಕೆ </strong>
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