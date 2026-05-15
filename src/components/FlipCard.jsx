import { useState, useEffect, useRef } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [prevDigit, setPrevDigit] = useState(digit);
  const [pending, setPending] = useState(null);
  
  const cardRef = useRef(null);
  const nextRef = useRef(digit);

  // Adjusting state during render
  if (digit !== prevDigit) {
    setPrevDigit(digit);
    if (flipping) {
      setPending(digit);
    } else {
      setNext(digit);
      setFlipping(true);
    }
  }

  // Update nextRef whenever next changes
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !flipping) return;

    const onEnd = (e) => {
      if (e.animationName !== 'flip-bottom-anim') return;
      
      const latest = nextRef.current;
      setCurrent(latest);
      setNext(latest);
      setFlipping(false);
      
      if (pending !== null && pending !== latest) {
        const nextPending = pending;
        setPending(null);
        // Small delay to ensure clean transition
        setTimeout(() => {
          setNext(nextPending);
          setFlipping(true);
        }, 20);
      }
    };

    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, [flipping, pending]);

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
