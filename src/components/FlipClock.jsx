import { useState, useEffect, useRef } from 'react';
import FlipUnit from './FlipUnit';

function copyStyles(sourceDoc, targetDoc) {
  for (const s of sourceDoc.querySelectorAll('style')) {
    const c = targetDoc.createElement('style');
    c.textContent = s.textContent;
    targetDoc.head.appendChild(c);
  }
  for (const l of sourceDoc.querySelectorAll('link[rel="stylesheet"]')) {
    const c = targetDoc.createElement('link');
    c.rel = 'stylesheet';
    c.href = l.href;
    targetDoc.head.appendChild(c);
  }
}

function createCard(doc, digit) {
  const el = doc.createElement('div');
  el.className = 'flip-card';
  el.dataset.current = digit;
  el.dataset.next = digit;
  el.innerHTML = `
    <div class="card-half card-top" data-value="${digit}"></div>
    <div class="card-half card-bottom" data-value="${digit}"></div>
    <div class="card-flip flip-top" data-value="${digit}"></div>
    <div class="card-flip flip-bottom" data-value="${digit}"></div>`;
  return el;
}

function updateCard(el, newDigit) {
  const cur = el.dataset.current;
  if (newDigit === cur && !el.classList.contains('flipping')) return;

  if (el.classList.contains('flipping')) {
    el.dataset.pending = newDigit;
    return;
  }

  const top = el.querySelector('.flip-top');
  const bot = el.querySelector('.flip-bottom');
  const staticTop = el.querySelector('.card-top');
  const staticBottom = el.querySelector('.card-bottom');

  el.dataset.next = newDigit;
  if (staticTop) staticTop.dataset.value = newDigit;
  if (staticBottom) staticBottom.dataset.value = cur;
  if (top) top.dataset.value = cur;
  if (bot) bot.dataset.value = newDigit;

  const onEnd = (e) => {
    if (e.animationName !== 'flip-bottom-anim') return;
    el.removeEventListener('animationend', onEnd);
    
    const latest = el.dataset.next;
    el.dataset.current = latest;
    el.classList.remove('flipping');
    
    // Sync all layers to the final state
    if (staticTop) staticTop.dataset.value = latest;
    if (staticBottom) staticBottom.dataset.value = latest;
    if (top) top.dataset.value = latest;
    if (bot) bot.dataset.value = latest;
    
    const pending = el.dataset.pending;
    if (pending) {
      el.dataset.pending = '';
      if (pending !== latest) {
        // Force reflow and restart
        el.offsetHeight; 
        setTimeout(() => updateCard(el, pending), 20);
      }
    }
  };

  el.addEventListener('animationend', onEnd);
  el.classList.add('flipping');
}

const PIP_OVERRIDES = `
  :root { --flip-speed: 0.42s; --flip-ease: cubic-bezier(0.4, 0, 0.2, 1); }
  .flip-card { width:54px; height:80px; font-size:44px; line-height:80px; border-radius:6px; perspective: 400px; }
  .unit-cards { gap:0.4rem }
  .flip-clock { gap:0.5rem }
  .unit-divider { font-size:28px; transform: translateY(-4px); }
  .clock-container { padding:0.75rem 1rem; gap:0.5rem; border-radius:16px }
  .clock-shell { padding:0; border-radius:20px }
  .date-info { gap:0.15rem }
  .day-name { font-size:0.55rem; letter-spacing:4px }
  .full-date { font-size:0.5rem; letter-spacing:1px }
  .clock-footer { font-size:0.45rem; gap:0.3rem; margin-top: 2px; }
  .footer-dot { width:4px; height:4px }
  .ampm-indicator { padding:0.2rem 0.4rem; font-size:0.5rem; letter-spacing:1px; border-radius: 4px; }
  .unit-label { font-size: 0.45rem; letter-spacing: 1px; gap: 0.4rem; }
  .flip-unit { gap: 0.4rem; }
`;

function setupPipFlipClock(pipWindow, parentDoc, initialIs24Hour) {
  copyStyles(parentDoc, pipWindow.document);
  const ov = pipWindow.document.createElement('style');
  ov.textContent = PIP_OVERRIDES;
  pipWindow.document.head.appendChild(ov);
  pipWindow.document.title = 'Aurora Clock';

  const body = pipWindow.document.body;
  Object.assign(body.style, {
    margin: '0',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#030303',
    background: 'radial-gradient(at 10% 10%, rgba(30, 40, 80, 0.4) 0, transparent 55%)'
  });

  const wrap = pipWindow.document.createElement('div');
  wrap.className = 'clock-wrapper';
  wrap.style.padding = '0';
  wrap.style.animation = 'none';
  body.appendChild(wrap);

  const shell = pipWindow.document.createElement('div');
  shell.className = 'clock-shell';
  wrap.appendChild(shell);

  const container = pipWindow.document.createElement('div');
  container.className = 'clock-container';
  shell.appendChild(container);

  const dateInfo = pipWindow.document.createElement('div');
  dateInfo.className = 'date-info';
  container.appendChild(dateInfo);

  const dayName = pipWindow.document.createElement('span');
  dayName.className = 'day-name';
  dateInfo.appendChild(dayName);

  const fullDate = pipWindow.document.createElement('span');
  fullDate.className = 'full-date';
  dateInfo.appendChild(fullDate);

  const flipClock = pipWindow.document.createElement('div');
  flipClock.className = 'flip-clock';
  container.appendChild(flipClock);

  const allCards = [];
  const cardDefs = [
    { label: 'Hours', cards: [createCard(pipWindow.document, '0'), createCard(pipWindow.document, '0')] },
    { label: 'Minutes', cards: [createCard(pipWindow.document, '0'), createCard(pipWindow.document, '0')] },
    { label: 'Seconds', cards: [createCard(pipWindow.document, '0'), createCard(pipWindow.document, '0')] },
  ];

  cardDefs.forEach((unit, i) => {
    if (i > 0) {
      const div = pipWindow.document.createElement('span');
      div.className = 'unit-divider';
      div.textContent = ':';
      flipClock.appendChild(div);
    }
    const u = pipWindow.document.createElement('div');
    u.className = 'flip-unit';
    const c = pipWindow.document.createElement('div');
    c.className = 'unit-cards';
    unit.cards.forEach((card) => { c.appendChild(card); allCards.push(card); });
    u.appendChild(c);
    const lbl = pipWindow.document.createElement('span');
    lbl.className = 'unit-label';
    lbl.textContent = unit.label;
    u.appendChild(lbl);
    flipClock.appendChild(u);
  });

  const ampmBox = pipWindow.document.createElement('div');
  ampmBox.className = 'ampm-indicator';
  flipClock.appendChild(ampmBox);

  const footer = pipWindow.document.createElement('div');
  footer.className = 'clock-footer';
  container.appendChild(footer);

  const fl1 = pipWindow.document.createElement('span');
  fl1.textContent = 'Mini Player';
  footer.appendChild(fl1);

  const dot = pipWindow.document.createElement('span');
  dot.className = 'footer-dot';
  footer.appendChild(dot);

  const fl2 = pipWindow.document.createElement('span');
  fl2.textContent = 'Live';
  footer.appendChild(fl2);

  // Store current mode in a way the interval can access
  let currentIs24Hour = initialIs24Hour;

  const update = () => {
    if (pipWindow.closed) return;
    const now = new Date();
    dayName.textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
    fullDate.textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    
    let hours = now.getHours();
    if (!currentIs24Hour) {
      ampmBox.style.display = 'block';
      ampmBox.textContent = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    } else {
      ampmBox.style.display = 'none';
    }

    const digits = [
      String(hours).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('').split('');

    digits.forEach((d, i) => { if (i < allCards.length) updateCard(allCards[i], d); });
  };

  update(); 
  const timer = setInterval(update, 1000);

  // Return an object with cleanup and update methods
  return {
    cleanup: () => clearInterval(timer),
    updateMode: (is24) => {
      currentIs24Hour = is24;
      update();
    }
  };
}

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const pipWindowRef = useRef(null);
  const pipControllerRef = useRef(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      navigator.standalone === true;
  });

  // Sync PiP window mode when is24Hour changes
  useEffect(() => {
    if (pipControllerRef.current) {
      pipControllerRef.current.updateMode(is24Hour);
    }
  }, [is24Hour]);

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const handler = () => setIsInstalled(
      mql.matches || navigator.standalone === true
    );
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  useEffect(() => {
    const handleEnter = () => setIsPiP(true);
    const dpip = documentPictureInPicture;
    if (!dpip) return;
    dpip.addEventListener('enter', handleEnter);
    return () => dpip.removeEventListener('enter', handleEnter);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) setTime(new Date());
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handlePiP = async () => {
    const dpip = documentPictureInPicture;
    if (!dpip) return;
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      return;
    }
    try {
      const pipWindow = await dpip.requestWindow({ width: 520, height: 320 });
      pipWindowRef.current = pipWindow;
      pipControllerRef.current = setupPipFlipClock(pipWindow, document, is24Hour);
      
      pipWindow.addEventListener('pagehide', () => {
        if (pipControllerRef.current) pipControllerRef.current.cleanup();
        pipWindowRef.current = null;
        pipControllerRef.current = null;
        setIsPiP(false);
      });
      setIsPiP(true);
    } catch (err) {
      console.error('Failed to enter PiP:', err);
    }
  };

  let hours = time.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (!is24Hour) hours = hours % 12 || 12;

  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
  const offsetMinutes = -time.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetAbs = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(offsetAbs / 60)).padStart(2, '0');
  const offsetMins = String(offsetAbs % 60).padStart(2, '0');
  const utcOffset = `UTC${offsetSign}${offsetHours}:${offsetMins}`;

  const formattedDay = time.toLocaleDateString(undefined, { weekday: 'long' });
  const formattedDate = time.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const supportsPiP = typeof documentPictureInPicture !== 'undefined';

  return (
    <div className="clock-wrapper">
      <header className="clock-header">
        <div className="brand">
          <img src="/logo.svg" alt="FlipClock" className="brand-mark" />
          <div className="brand-text">
            <span className="brand-title">Aurora Flipclock</span>
            <span className="brand-subtitle">Precision timekeeping</span>
          </div>
        </div>
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

      <div className="clock-shell">
        <div className="ambient-glow"></div>
        <div className="clock-container">
          <div className="date-info">
            <span className="day-name">{formattedDay}</span>
            <span className="full-date">{formattedDate}</span>
          </div>

          <div className="meta-row">
            <span className="meta-pill">{utcOffset}</span>
            <span className="meta-pill">{timeZone}</span>
            <span className="meta-pill live">Live</span>
          </div>

          <div className="flip-clock">
            <FlipUnit value={hours} label="Hours" />
            <span className="unit-divider" aria-hidden="true">:</span>
            <FlipUnit value={minutes} label="Minutes" />
            <span className="unit-divider" aria-hidden="true">:</span>
            <FlipUnit value={seconds} label="Seconds" />
            {!is24Hour && (
              <div className="ampm-indicator">
                <span>{ampm}</span>
              </div>
            )}
          </div>

          <div className="clock-footer">
            <span className="footer-label">System clock</span>
            <span className="footer-dot" aria-hidden="true"></span>
            <span className="footer-label">Auto-sync</span>
          </div>
        </div>
      </div>

      <div className="pwa-controls">
        {deferredPrompt && !isInstalled && (
          <button className="pwa-btn install-btn" onClick={handleInstall} title="Install app">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        )}
        <button className="pwa-btn fullscreen-btn" onClick={handleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen
            ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          }
        </button>
        {supportsPiP && (
          <button className="pwa-btn pip-btn" onClick={handlePiP} title={isPiP ? 'Close mini player' : 'Mini player'}>
            {isPiP
              ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="11" y="9" width="9" height="6" rx="1"/></svg>
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default FlipClock;
