import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LiquidGlass } from './LiquidGlass';

export const MobileMenuOverlay = ({ isOpen, onClose }) => {
  const navLinks = ['Home', 'Features', 'How It Works', 'For Doctors'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-8 bg-black/80 backdrop-blur-xl md:hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 font-dmsans text-2xl font-medium"
          >
            {navLinks.map((link) => (
              <Link
                key={link}
                to={
                  link === 'Home'
                    ? '/'
                    : `/${link.toLowerCase().replace(/\s+/g, '-')}`
                }
                onClick={onClose}
                className="text-white hover:text-white/80 transition-colors"
              >
                {link}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 flex flex-col items-center gap-2"
          >
            <LiquidGlass className="h-12 w-12 rounded-full flex items-center justify-center">
              <CircleUserRound className="h-6 w-6 text-white/80 stroke-[1.5]" />
            </LiquidGlass>
            <span className="font-inter text-sm font-light text-white/60">My Account</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
