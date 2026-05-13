import { useState, useEffect } from 'react';

const FlipCard = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [prevDigit, setPrevDigit] = useState(digit);

  if (digit !== prevDigit) {
    setPrevDigit(digit);
    setNext(digit);
    setFlipping(true);
  }

  useEffect(() => {
    if (flipping) {
      const timer = setTimeout(() => {
        setCurrent(next);
        setFlipping(false);
      }, 700); // Matches --flip-speed (0.7s) exactly
      return () => clearTimeout(timer);
    }
  }, [flipping, next]);

  return (
    <div className={`flip-card ${flipping ? 'flipping' : ''}`}>
      {/* Top half of the NEXT digit (revealed when leaf falls) */}
      <div className="card-half card-top" data-value={next}></div>
      
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
