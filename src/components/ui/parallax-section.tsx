import { useEffect, useRef, ReactNode, useState } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  fadeIn?: boolean;
}

const ParallaxSection = ({
  children,
  className = '',
  speed = 0.15,
  direction = 'up',
  fadeIn = true
}: ParallaxSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Refs for animation state to avoid re-renders
  const targetY = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Observer for fade-in trigger
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );
    observer.observe(section);

    const updatePosition = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionMiddle = rect.top + rect.height / 2; // Position relative to viewport
      const center = windowHeight / 2;

      // Calculate target offset based on scroll position
      // When section is at center, offset is 0
      const distFromCenter = center - sectionMiddle;
      targetY.current = distFromCenter * speed * (direction === 'up' ? 1 : -1);
    };

    const animate = () => {
      // Lerp for smooth movement: current = current + (target - current) * factor
      const ease = 0.08; // Lower = smoother/slower, Higher = snappier
      currentY.current += (targetY.current - currentY.current) * ease;

      // Round to 3 decimal places to avoid sub-pixel jitter
      const y = Math.round(currentY.current * 1000) / 1000;

      if (section) {
        section.style.transform = `translate3d(0, ${y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updatePosition(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [speed, direction]);

  return (
    <div
      ref={sectionRef}
      className={`will-change-transform transition-opacity duration-1000 ease-out ${className} ${fadeIn ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-8') : 'opacity-100'
        }`}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;
