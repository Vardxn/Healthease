import React from 'react';

export const useWordReveal = (text, startDelayStep = 3) => {
  const words = text.split(' ');
  
  return words.map((word, index) => {
    const delayClass = `delay-${(startDelayStep + index) * 100}`;
    return (
      <span key={index} className="inline-block overflow-hidden mr-[0.25em] last:mr-0 h-fit pb-1">
        <span className={`inline-block animate-word-reveal ${delayClass}`}>
          {word}
        </span>
      </span>
    );
  });
};
