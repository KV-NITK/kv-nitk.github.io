const fs = require('fs');
let code = fs.readFileSync('src/components/Parva26/market/merch-overlay.jsx', 'utf8');

const regex = /<div className="mt-4 flex flex-wrap items-center justify-between gap-3">[\s\S]*?<\/div>\s*<p role="status"/;

const replacement = `<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {early && !closed && <EarlyFlag subtitles={subtitles} />}
          {closed ? (
            <p className="font-kn-display text-lg font-bold text-[#f3ead5]">
              <span lang="kn">ಬುಕ್ಕಿಂಗ್ ಮುಚ್ಚಿದೆ</span>
              <En className="block font-kn-body text-base">Booking closed</En>
            </p>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              data-en="Add to Cart"
              disabled={added}
              className="group relative ml-auto block rotate-[1.5deg] rounded-sm drop-shadow-[0_0.5rem_0.6rem_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina disabled:opacity-80"
            >
              <span className="relative flex min-h-14 items-center bg-arishina py-2 pl-5 pr-4 text-theatre transition-transform duration-200 group-hover:-translate-y-0.5" style={PERFORATED}>
                <span className="flex flex-col">
                  <span lang="kn" className="font-kn-display text-xl font-extrabold leading-none">
                    {user === null ? "IRIS ಲಾಗಿನ್" : (added ? "ಸೇರಿಸಲಾಗಿದೆ!" : "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ")}
                  </span>
                  <span className="mt-1 font-kn-body text-base font-bold leading-none">
                    {user === null ? "Login with IRIS" : (added ? "Added to Cart" : "Add to Cart")}
                  </span>
                </span>
                <span aria-hidden className="absolute inset-0 opacity-40 mix-blend-multiply" style={paper} />
              </span>
            </button>
          )}
        </div>
        <p role="status"`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/Parva26/market/merch-overlay.jsx', code, 'utf8');
console.log('Success');
