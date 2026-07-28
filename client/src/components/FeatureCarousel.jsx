import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanLine, Video, PillBottle, Bot } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';

const carouselItems = [
  {
    icon: ScanLine,
    colorClass: 'bg-black',
    text: 'Smart OCR reads any prescription in seconds',
  },
  {
    icon: Video,
    colorClass: 'bg-emerald-800',
    text: 'Live video consults with verified doctors',
  },
  {
    icon: PillBottle,
    colorClass: 'bg-cyan-800',
    text: 'Never miss a dose with smart reminders',
  },
  {
    icon: Bot,
    colorClass: 'bg-amber-700',
    text: 'Dr. AI answers questions about your own records',
  },
];

export const FeatureCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { demoLogin } = useContext(AuthContext);
  const { resetDemoSession } = useContext(GuestContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleExploreDemo = async () => {
    resetDemoSession();
    const result = await demoLogin();
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[160px] relative overflow-hidden">
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-4 absolute inset-0"
          >
            {React.createElement(carouselItems[activeIndex].icon, {
              className: `h-10 w-10 sm:h-12 sm:w-12 rounded-full p-2.5 sm:p-3 text-white flex-shrink-0 ${carouselItems[activeIndex].colorClass}`,
            })}
            <p className="font-inter text-sm sm:text-base lg:text-lg text-black/80 font-normal leading-[1.2] tracking-[-0.03em] pt-1">
              {carouselItems[activeIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 w-full mt-4">
        {carouselItems.map((_, idx) => (
          <div
            key={idx}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              idx === activeIndex ? 'bg-black' : 'bg-black/20'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={handleExploreDemo}
        className="mt-5 self-start rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-medium text-black/75 transition-colors hover:bg-black/10"
      >
        Explore Demo Space
      </button>
    </div>
  );
};
