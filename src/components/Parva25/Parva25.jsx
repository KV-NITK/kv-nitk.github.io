import Silk from "../../reactbits_components/Silk"
import parvaLogo from "../../images/parva/logo.png"
import DomeGallery from "../../reactbits_components/DomeGallery"
import contacts from "../../consta/contacts.json"
import TeamCarousel from "../../reactbits_components/TeamCarousel"
import MagicBento from "../../reactbits_components/bento"
import LogoLoop from "../../reactbits_components/LogoLoop"

const Parva25 = () => {
    // Alternative with image sources
    const techLogos = [
        { src: "/sponsors/sponsor1.png", alt: "Sponsor 1", href: "https://sponsor1.com" },
        { src: "/sponsors/sponsor2.png", alt: "Sponsor 2", href: "https://sponsor2.com" },
        { src: "/sponsors/sponsor3.png", alt: "Sponsor 3", href: "https://sponsor3.com" },
    ];
    return (
        <div className="w-full h-full bg-linear-to-b from-[#FFDA1D] to-yellow-500">
            <div className="w-full h-[600px] relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Silk />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <h1 className="text-white text-9xl leading-none font-extrabold tracking-[2px] uppercase noto-serif-kannada-400">
                        ಪರ್ವ ೨೫
                    </h1>
                    <h1 className="text-red-500 text-5xl font-extrabold tracking-[2px] uppercase noto-serif-kannada-600">
                        Parva 25
                    </h1>
                    <p className="text-white">
                        From 31th October to 2nd November
                    </p>
                </div>
            </div>

            {/* About Parva 2025 */}
            <section className="w-full py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col justify-center items-center">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#FFDA1D]">Discover Parva 2025</h2>:
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">Celebrating Karnataka's Rich Cultural Heritage</h2>
                            <p className="mt-4 text-muted-foreground leading-7 text-center">
                                Join us for Parva 2025: A grand celebration by NITK Kannada Vedike, paying homage to the 69th Kannada Rajyotsava and the 52nd anniversary of Karnataka's renaming. It's more than a festival; it's a vibrant tribute to language, art, and culture. Since 1960, Parva has grown into a magnificent cultural extravaganza, and this year, we're making it even bigger and better. Come celebrate Karnataka's diverse traditions, art, and linguistic splendor with us. Experience an enriching tapestry of music, dance, and festivities, showcasing the essence of Karnataka.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events */}
            <div className="w-full h-full flex items-center justify-center">
                <MagicBento />
            </div>
            {/* Team */}
            <section className="w-full py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <TeamCarousel
                        items={contacts.map((c) => ({
                            image: c.image || c.docUrl,
                            name: c.name,
                            title: c.role
                        }))}
                    />
                </div>
            </section>

            {/* Sponsors */}
            <section className="w-full py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <LogoLoop
                        logos={techLogos}
                        speed={120}
                        direction="left"
                        logoHeight={48}
                        gap={40}
                        pauseOnHover
                        scaleOnHover
                        fadeOut
                        fadeOutColor="#ffffff"
                        ariaLabel="Technology partners"
                    />
                </div>
            </section>

            {/* Gallery */}
            <div style={{ width: '100vw', height: '100vh' }}>
                <DomeGallery />
            </div>
        </div>
    )
}

export default Parva25