import { lightArr, darkArr } from "./_Data";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const displayArr = [
  {
    title: "Find Your Perfect Space",
    desc: "Explore unique apartments tailored to your comfort.",
  },
  {
    title: "Where Comfort Meets Style",
    desc: "Modern homes in scenic locations await you.",
  },
  {
    title: "Live the Lifestyle You Deserve",
    desc: "Curated homes with exceptional amenities.",
  },
  {
    title: "Discover Your New Home",
    desc: "Browse properties handpicked for your lifestyle.",
  },
];

const IMAGE_TRANSITION = { duration: 1, ease: "easeInOut" };
const CONTENT_TRANSITION = { duration: 0.5, ease: "easeOut" };

const Hero = ({ theme }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [imgsArr, setImgsArr] = useState(() =>
    theme === "dark" ? darkArr : lightArr
  );
  const [fade, setFade] = useState(true);
  const [index, setIndex] = useState(0);

  // Preload images
  useEffect(() => {
    const preloadImages = [...new Set([...lightArr, ...darkArr])];
    preloadImages.forEach((src) => {
      new Image().src = src;
    });
  }, []);

  // Handle theme changes
  useEffect(() => {
    setImgsArr(theme === "dark" ? darkArr : lightArr);
    setIndex(0);
  }, [theme]);

  // Check prefers-reduced-motion
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Handle looping transition
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % imgsArr.length);
        setTimeout(() => setFade(true), 100);
      }, 500);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [imgsArr, reducedMotion]);

  return (
    <div className="relative h-[85dvh] w-full flex justify-center items-center font-inter text-white">
      {/* Hero Image */}
      <div className="absolute top-0 left-0 w-full h-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={imgsArr[index]}
            src={imgsArr[index]}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ IMAGE_TRANSITION }}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
            loading={index === 0 ? "eager" : "lazy"}
            alt="Hero background"
          />
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <span className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-black/80 dark:via-black/50 dark:to-black/10"></span>

      {/* Hero Content */}
      <div className="container z-10 flex flex-col">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: fade ? 1 : 0, y: fade ? 0 : 20 }}
          transition={{ CONTENT_TRANSITION }}
        >
          <h1
            className="text-[clamp(2rem,3.75vw+.4rem,4.5rem)] max-md:text-center font-extrabold leading-[1.1] drop-shadow-lg 
            bg-gradient-to-r from-purple-800 via-pink-700 to-red-700 
          dark:from-purple-300 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent"
          >
            {displayArr[index].title}
          </h1>
          <p className="text-[clamp(1rem,1.2vw+.3rem,1.7rem)] max-md:text-center  mt-4 max-w-2xl mx-auto md:mx-0 text-white/90 dark:text-white/80 drop-shadow-sm">
            {displayArr[index].desc}
          </p>
        </motion.div>
        {/* CTA Button */}
        <a
          href="#properties"
          className="px-6 py-3 text-sm md:text-lg max-md:mx-auto md:self-start mt-12 bg-gradient-to-r from-purple-700 to-pink-700 text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg whitespace-nowrap ring-2 ring-purple-600 hover:ring-pink-400 ring-offset-2 ring-offset-gray-900/80"
        >
          Browse All Properties
        </a>
        {/* Stats */}
        <div className="mt-12 flex gap-3 sm:gap-6 flex-wrap justify-center md:justify-start">
          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm px-3 md:px-6 py-3 rounded-lg ">
            <p className="text-xl md:text-2xl font-bold">500+</p>
            <p className="text-sm opacity-80">Properties</p>
          </div>
          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm px-3 md:px-6  py-3 rounded-lg ">
            <p className="text-xl md:text-2xl font-bold">4.9★</p>
            <p className="text-sm opacity-80">Average Rating</p>
          </div>
          <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm px-3 md:px-6  py-3 rounded-lg ">
            <p className="text-xl md:text-2xl font-bold">50+</p>
            <p className="text-sm opacity-80">Cities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
