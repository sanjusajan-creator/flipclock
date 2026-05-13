import { useState, useEffect, useRef, useCallback } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const prevDigitRef = useRef(digit);
  const cardRef = useRef(null);
  const animEndRef = useRef(null);
  const midFlipRef = useRef(null);

  const finishFlip = useCallback(() => {
    setCurrent((prev) => (prev === next ? prev : next));
    setFlipping(false);
  }, [next]);

  useEffect(() => {
    if (digit !== prevDigitRef.current) {
      prevDigitRef.current = digit;
      setNext(digit);
      setFlipping(true);
    }
  }, [digit]);

  useEffect(() => {
    if (!flipping) return () => {};
    const root = document.documentElement;
    const speedRaw = getComputedStyle(root).getPropertyValue('--flip-speed').trim();
    const duration = (parseFloat(speedRaw) || 0.55) * 1000;
    const midPoint = Math.max(0, duration * 0.55);

    if (midFlipRef.current) clearTimeout(midFlipRef.current);
    midFlipRef.current = setTimeout(() => {
      setCurrent((prev) => (prev === next ? prev : next));
    }, midPoint);

    return () => {
      if (midFlipRef.current) clearTimeout(midFlipRef.current);
    };
  }, [flipping, next]);

  useEffect(() => {
    const el = cardRef.current;
    if (flipping && el) {
      const handler = (e) => {
        if (e.animationName === 'flip-down') finishFlip();
      };
      animEndRef.current = handler;
      el.addEventListener('animationend', handler);
      return () => el.removeEventListener('animationend', handler);
    }
  }, [flipping, finishFlip]);

  return (
    <div ref={cardRef} className={`flip-card ${flipping ? 'flipping' : ''}`}>
      {/* Top half shows current digit during flip, next when settled */}
      <div className="card-half card-top" data-value={flipping ? current : next}></div>
      
      {/* Bottom half of the CURRENT digit (stays until flip ends) */}
      <div className="card-half card-bottom" data-value={current}></div>
      
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
