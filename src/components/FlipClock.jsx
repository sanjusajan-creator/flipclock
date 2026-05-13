import { useState, useEffect } from 'react';
import FlipUnit from './FlipUnit';

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  let hours = time.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  if (!is24Hour) {
    hours = hours % 12 || 12;
  }

  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formattedDay = time.toLocaleDateString(undefined, { weekday: 'long' });
  const formattedDate = time.toLocaleDateString(undefined, { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="clock-wrapper">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;900&display=swap" rel="stylesheet" />
      
      <header className="clock-header">
        <div className="controls">
          <button 
            className={`toggle-btn ${!is24Hour ? 'active' : ''}`}
            onClick={() => setIs24Hour(false)}
          >
            12H
          </button>
          <button 
            className={`toggle-btn ${is24Hour ? 'active' : ''}`}
            onClick={() => setIs24Hour(true)}
          >
            24H
          </button>
        </div>
      </header>

      <div className="clock-container">
        <div className="ambient-glow"></div>
        <div className="date-info">
          <span className="day-name">{formattedDay}</span>
          <span className="full-date">{formattedDate}</span>
        </div>
        
        <div className="flip-clock">
          <FlipUnit value={hours} label="Hours" />
          <FlipUnit value={minutes} label="Minutes" />
          <FlipUnit value={seconds} label="Seconds" />
          {!is24Hour && (
            <div className="ampm-indicator">
              <span>{ampm}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipClock;
