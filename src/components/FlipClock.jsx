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
    <div class="leaf">
      <div class="leaf-front" data-value="${digit}"></div>
      <div class="leaf-back" data-value="${digit}"></div>
    </div>`;
  return el;
}

function updateCard(el, newDigit) {
  const cur = el.dataset.current;
  const nxt = el.dataset.next;
  if (newDigit === nxt) return;
  el.dataset.next = newDigit;
  if (el.classList.contains('flipping')) return;

  const root = el.ownerDocument.documentElement;
  const speedRaw = getComputedStyle(root).getPropertyValue('--flip-speed').trim();
  const duration = (parseFloat(speedRaw) || 0.55) * 1000;
  const midPoint = duration * 0.55;

  const f = el.querySelector('.leaf-front');
  const b = el.querySelector('.leaf-back');
  const bottom = el.querySelector('.card-bottom');
  if (f) f.dataset.value = cur;
  if (b) b.dataset.value = newDigit;

  const handleEnd = () => {
    el.removeEventListener('animationend', handleEnd);
    const latest = el.dataset.next;
    el.dataset.current = latest;
    el.classList.remove('flipping');
    for (const sel of ['.card-top', '.card-bottom', '.leaf-front', '.leaf-back']) {
      const e = el.querySelector(sel);
      if (e) e.dataset.value = latest;
    }
  };

  const handleStart = (e) => {
    if (e.animationName !== 'flip-down') return;
    el.removeEventListener('animationstart', handleStart);
    if (bottom) bottom.dataset.value = cur;
    setTimeout(() => {
      if (bottom) bottom.dataset.value = el.dataset.next;
    }, midPoint);
  };

  el.addEventListener('animationstart', handleStart);
  el.addEventListener('animationend', handleEnd);
  el.classList.add('flipping');
}

const PIP_OVERRIDES = `
.flip-card { width:54px; height:80px; font-size:44px; line-height:80px; border-radius:6px }
.unit-cards { gap:0.4rem }
.flip-clock { gap:0.5rem }
.unit-divider { font-size:28px }
.clock-container { padding:0.75rem 1rem; gap:0.5rem; border-radius:16px }
.clock-shell { padding:0; border-radius:20px }
.date-info { gap:0.15rem }
.day-name { font-size:0.55rem; letter-spacing:6px }
.full-date { font-size:0.5rem }
.clock-footer { font-size:0.5rem; gap:0.3rem }
.footer-dot { width:4px; height:4px }
`;

function setupPipFlipClock(pipWindow, parentDoc) {
  copyStyles(parentDoc, pipWindow.document);
  const ov = pipWindow.document.createElement('style');
  ov.textContent = PIP_OVERRIDES;
  pipWindow.document.head.appendChild(ov);
  pipWindow.document.title = 'FlipClock';

  const speedRaw = getComputedStyle(parentDoc.documentElement).getPropertyValue('--flip-speed').trim();
  const flipSpeed = (parseFloat(speedRaw) || 0.7) * 1000;

  const body = pipWindow.document.body;
  body.style.margin = '0';
  body.style.minHeight = '100vh';
  body.style.display = 'flex';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';
  body.style.overflow = 'hidden';
  body.style.backgroundColor = '#030303';

  const wrap = pipWindow.document.createElement('div');
  wrap.className = 'clock-wrapper';
  wrap.style.animation = 'none';
  body.appendChild(wrap);

  const shell = pipWindow.document.createElement('div');
  shell.className = 'clock-shell';
  wrap.appendChild(shell);

  const glow = pipWindow.document.createElement('div');
  glow.className = 'ambient-glow';
  shell.appendChild(glow);

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

  const footer = pipWindow.document.createElement('div');
  footer.className = 'clock-footer';
  container.appendChild(footer);

  const fl1 = pipWindow.document.createElement('span');
  fl1.className = 'footer-label';
  fl1.textContent = 'Mini player';
  footer.appendChild(fl1);

  const dot = pipWindow.document.createElement('span');
  dot.className = 'footer-dot';
  dot.setAttribute('aria-hidden', 'true');
  footer.appendChild(dot);

  const fl2 = pipWindow.document.createElement('span');
  fl2.className = 'footer-label';
  fl2.textContent = 'Live';
  footer.appendChild(fl2);

  const timer = setInterval(() => {
    if (pipWindow.closed) { clearInterval(timer); return; }
    const now = new Date();
    dayName.textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
    fullDate.textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    const digits = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0')].join('').split('');
    digits.forEach((d, i) => { if (i < allCards.length) updateCard(allCards[i], d, flipSpeed); });
  }, 1000);

  return timer;
}

const FlipClock = () => {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const pipWindowRef = useRef(null);
  const pipTimerRef = useRef(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      navigator.standalone === true;
  });

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
    const pipWindow = await dpip.requestWindow({ width: 520, height: 300 });
    pipWindowRef.current = pipWindow;
    pipTimerRef.current = setupPipFlipClock(pipWindow, document);
    pipWindow.addEventListener('pagehide', () => {
      if (pipTimerRef.current) clearInterval(pipTimerRef.current);
      pipWindowRef.current = null;
      pipTimerRef.current = null;
      setIsPiP(false);
    });
    setIsPiP(true);
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
