import { useState, useEffect, useRef } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const oldDigitRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (digit !== current) {
      oldDigitRef.current = current;
      setFlipping(true);
    }
  }, [digit, current]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !flipping) return;

    const onEnd = (e) => {
      if (e.animationName === 'flip-down') {
        setCurrent(digit);
        setFlipping(false);
      }
    };

    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, [flipping, digit]);

  const showDigit = flipping ? oldDigitRef.current : current;

  return (
    <div ref={cardRef} className={`flip-card ${flipping ? 'flipping' : ''}`}>
      <div className="card-half card-top" data-value={showDigit}></div>
      <div className="card-half card-bottom" data-value={showDigit}></div>
      <div className="leaf">
        <div className="leaf-front" data-value={showDigit}></div>
        <div className="leaf-back" data-value={digit}></div>
      </div>
    </div>
  );
};

export default FlipCard;
