import { useState, useEffect, useRef } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const pendingRef = useRef(null);
  const cardRef = useRef(null);
  const nextRef = useRef(digit);
  nextRef.current = next;

  useEffect(() => {
    if (digit === current) {
      if (!flipping) setNext(digit);
      return;
    }
    if (flipping) {
      pendingRef.current = digit;
      return;
    }
    setNext(digit);
    setFlipping(true);
  }, [digit, current, flipping]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !flipping) return;

    const onEnd = (e) => {
      if (e.animationName !== 'flip-bottom-anim') return;
      const latest = nextRef.current;
      setCurrent(latest);
      setNext(latest);
      setFlipping(false);
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== undefined && pending !== null && pending !== latest) {
        setNext(pending);
        setFlipping(true);
      }
    };

    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, [flipping]);

  return (
    <div ref={cardRef} className={`flip-card ${flipping ? 'flipping' : ''}`}>
      <div className="card-half card-top" data-value={flipping ? next : current}></div>
      <div className="card-half card-bottom" data-value={current}></div>
      <div className="card-flip flip-top" data-value={current}></div>
      <div className="card-flip flip-bottom" data-value={next}></div>
    </div>
  );
};

export default FlipCard;
