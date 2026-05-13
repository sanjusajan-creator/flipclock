import { useState, useEffect, useRef } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const pendingRef = useRef(null);
  const cardRef = useRef(null);
  const digitRef = useRef(digit);
  digitRef.current = digit;

  useEffect(() => {
    if (digit === current) return;
    if (flipping) {
      pendingRef.current = digit;
      return;
    }
    setFlipping(true);
  }, [digit, current, flipping]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !flipping) return;

    const onEnd = (e) => {
      if (e.animationName !== 'flip-bottom') return;
      const latest = digitRef.current;
      setCurrent(latest);
      setFlipping(false);
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== undefined && pending !== null && pending !== latest) {
        setFlipping(true);
      }
    };

    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, [flipping]);

  const oldDigit = flipping ? current : digit;

  return (
    <div ref={cardRef} className={`flip-card ${flipping ? 'flipping' : ''}`}>
      <div className="card-half card-top" data-value={digit}></div>
      <div className="card-half card-bottom" data-value={digit}></div>
      <div className="card-flip flip-top" data-value={oldDigit}></div>
      <div className="card-flip flip-bottom" data-value={digit}></div>
    </div>
  );
};

export default FlipCard;
