import React, { useCallback, useEffect, useRef, useState } from 'react';
import CurtainTransition, { CLOSE_MS, HOLD_MS, OPEN_MS } from './components/CurtainTransition.jsx';
import LandingPage from './components/LandingPage.jsx';
import Photobooth from './components/Photobooth.jsx';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'booth'
  const [phase, setPhase] = useState('closed'); // starts closed so the curtains open on load
  const [label, setLabel] = useState('Lights, camera…');
  const busy = useRef(true);
  const timers = useRef([]);

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // Intro: curtains part to reveal the landing page.
  useEffect(() => {
    busy.current = true;
    later(() => setPhase('opening'), 450);
    later(() => {
      setPhase('open');
      busy.current = false;
    }, 450 + OPEN_MS);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  /**
   * Close the curtains, run `change` while the screen is covered,
   * hold briefly as a loading beat, then open on the new view.
   */
  const transition = useCallback((change, text = 'Lights, camera…') => {
    if (busy.current) return;
    busy.current = true;
    setLabel(text);
    setPhase('closing');
    later(() => {
      change();
      window.scrollTo(0, 0);
      setPhase('closed');
    }, CLOSE_MS);
    later(() => setPhase('opening'), CLOSE_MS + HOLD_MS);
    later(() => {
      setPhase('open');
      busy.current = false;
    }, CLOSE_MS + HOLD_MS + OPEN_MS);
  }, []);

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onEnter={() => transition(() => setView('booth'), 'Taking your seat')} />
      ) : (
        <Photobooth
          transition={transition}
          onExit={() => transition(() => setView('landing'), 'Back to the lobby')}
        />
      )}
      <CurtainTransition phase={phase} label={label} />
    </>
  );
}
