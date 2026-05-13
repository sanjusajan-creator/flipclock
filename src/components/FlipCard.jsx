import { useState, useEffect, useRef, useCallback } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [bottomDigit, setBottomDigit] = useState(digit);
  const prevDigitRef = useRef(digit);
  const currentRef = useRef(digit);
  const nextRef = useRef(digit);
  const cardRef = useRef(null);
  const midFlipRef = useRef(null);

  currentRef.current = current;
  nextRef.current = next;

  const finishFlip = useCallback(() => {
    if (midFlipRef.current) clearTimeout(midFlipRef.current);
    setCurrent(nextRef.current);
    setFlipping(false);
    setBottomDigit(nextRef.current);
  }, []);

  const scheduleBottomSwap = useCallback(() => {
    if (midFlipRef.current) clearTimeout(midFlipRef.current);
    const root = document.documentElement;
    const speedRaw = getComputedStyle(root).getPropertyValue('--flip-speed').trim();
    const duration = (parseFloat(speedRaw) || 0.55) * 1000;
    midFlipRef.current = setTimeout(() => {
      setBottomDigit(nextRef.current);
    }, duration * 0.55);
  }, []);

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
      setBottomDigit(currentRef.current);
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
      <div className="card-half card-top" data-value={current}></div>
      <div className="card-half card-bottom" data-value={bottomDigit}></div>
      <div className="leaf">
        <div className="leaf-front" data-value={current}></div>
        <div className="leaf-back" data-value={next}></div>
      </div>
    </div>
  );
};

export default FlipCard;
