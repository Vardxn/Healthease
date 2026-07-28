import React from 'react';
import { FeatureCarousel } from './FeatureCarousel';

export const ThreePanelFooter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] relative z-10 w-full border-t border-black/10">
      {/* PANEL 1 */}
      <div className="bg-[#ECEDEC] p-6 sm:p-8 lg:p-12 relative min-h-[220px] flex flex-col justify-between overflow-hidden animate-fade-up delay-900">
        <div className="max-w-[350px] z-10">
          <h3 className="font-dmsans text-2xl sm:text-[28px] lg:text-[35px] text-black font-normal leading-[1.1] tracking-[-0.05em] mb-4">
            Start turning prescriptions into peace of mind
          </h3>
          <a
            href="/health-score"
            className="font-inter font-normal text-base lg:text-lg text-black underline tracking-[-0.03em] hover:opacity-80 transition-opacity"
          >
            Take the Health Assessment
          </a>
        </div>
        {/* Abstract pill/pulse brand asset mock */}
        <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20 mix-blend-multiply pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="2" className="text-black" />
          </svg>
        </div>
      </div>

      {/* PANEL 2 */}
      <div className="bg-[#FEFDF9] p-6 sm:p-8 lg:p-12 border-y md:border-y-0 md:border-x border-black/5 animate-fade-up delay-1000">
        <FeatureCarousel />
      </div>

      {/* PANEL 3 */}
      <div className="bg-black p-6 sm:p-8 lg:p-12 flex items-center justify-between gap-6 overflow-hidden animate-fade-up delay-1100">
        <div className="flex-shrink-0 w-[120px] h-[82px] sm:w-[160px] h-[110px] lg:w-[208px] h-[142px] bg-neutral-900 border border-white/10 rounded-lg relative overflow-hidden">
          {/* Internal Dashboard UI Mockup */}
          <div className="absolute inset-x-2 top-2 h-3 bg-white/5 rounded-sm flex items-center px-1 gap-1">
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="w-8 h-1 rounded-sm bg-white/20" />
          </div>
          <div className="absolute inset-x-2 top-7 bottom-2 bg-white/5 rounded-sm p-1 flex flex-col gap-1">
            <div className="w-full h-full bg-emerald-500/10 rounded-sm border border-emerald-500/20" />
          </div>
        </div>
        <div className="flex flex-col justify-center max-w-[200px]">
          <span className="font-inter font-normal text-white text-2xl sm:text-3xl lg:text-[35px] tracking-[-0.05em] leading-none mb-1">
            +50K
          </span>
          <p className="font-inter font-normal text-white/60 text-sm sm:text-base lg:text-lg leading-[1.2]">
            prescriptions digitized and tracked
          </p>
        </div>
      </div>
    </div>
  );
};
