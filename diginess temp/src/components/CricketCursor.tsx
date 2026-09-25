import { useEffect, useRef } from 'react';
import './CricketCursor.css';

/**
 * Replaces the OS cursor with a small glowing tennis-ball dot on desktop/fine-pointer
 * devices only. Never mounts its tracking on touch devices, so mobile is untouched.
 */
const CricketCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    document.body.classList.add('cricket-cursor-active');

    let frame = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = dotRef.current;
        if (!el) return;
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    };

    const handleDown = () => dotRef.current?.classList.add('cricket-cursor--hit');
    const handleUp = () => dotRef.current?.classList.remove('cricket-cursor--hit');

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      document.body.classList.remove('cricket-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={dotRef} className="cricket-cursor" aria-hidden="true">
      <span className="cricket-cursor__seam" />
    </div>
  );
};

export default CricketCursor;
