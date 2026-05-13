import { useState, useEffect, useRef, useCallback } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [bottomDigit, setBottomDigit] = useState(digit);
  const prevDigitRef = useRef(digit);
  const cardRef = useRef(null);
  const midFlipRef = useRef(null);

  const finishFlip = useCallback(() => {
    if (midFlipRef.current) clearTimeout(midFlipRef.current);
    setCurrent((prev) => (prev === next ? prev : next));
    setFlipping(false);
    setBottomDigit(next);
  }, [next]);

  const scheduleBottomSwap = useCallback(() => {
    const root = document.documentElement;
    const speedRaw = getComputedStyle(root).getPropertyValue('--flip-speed').trim();
    const duration = (parseFloat(speedRaw) || 0.55) * 1000;
    const midPoint = duration * 0.55;

    if (midFlipRef.current) clearTimeout(midFlipRef.current);
    midFlipRef.current = setTimeout(() => {
      setBottomDigit(next);
    }, midPoint);
  }, [next]);

  useEffect(() => {
    if (digit !== prevDigitRef.current) {
      prevDigitRef.current = digit;
      setNext(digit);
      setFlipping(true);
    }
  }, [digit]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleStart = (e) => {
      if (e.animationName !== 'flip-down') return;
      setBottomDigit(current);
      scheduleBottomSwap();
    };

    const handleEnd = (e) => {
      if (e.animationName === 'flip-down') finishFlip();
    };

    el.addEventListener('animationstart', handleStart);
    el.addEventListener('animationend', handleEnd);

    return () => {
      el.removeEventListener('animationstart', handleStart);
      el.removeEventListener('animationend', handleEnd);
    };
  });

  return (
    <div ref={cardRef} className={`flip-card ${flipping ? 'flipping' : ''}`}>
      {/* Top half stays on current digit until flip ends */}
      <div className="card-half card-top" data-value={current}></div>
      
      {/* Bottom half changes mid-flip */}
      <div className="card-half card-bottom" data-value={bottomDigit}></div>
      
      {/* The flipping leaf */}
      <div className="leaf">
        {/* Top half of the CURRENT digit (falls forward) */}
        <div className="leaf-front" data-value={current}></div>
        {/* Bottom half of the NEXT digit (revealed as leaf hits bottom) */}
        <div className="leaf-back" data-value={next}></div>
      </div>
    </div>
  );
};

export default FlipCard;
