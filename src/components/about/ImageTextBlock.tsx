import { useRef, useEffect, useState } from "react";

interface ImageTextBlockProps {
  image: string;
  imageAlt: string;
  title: string;
  content: string;
  imagePosition?: 'left' | 'right';
}

const ImageTextBlock = ({
  image,
  imageAlt,
  title,
  content,
  imagePosition = 'left'
}: ImageTextBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(Math.max(0, Math.min(1, scrollProgress)));
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Parallax offset for image
  const parallaxOffset = (scrollY - 0.5) * 40;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${imagePosition === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center overflow-hidden`}
    >
      {/* Image with parallax effect */}
      <div className={`flex-1 overflow-hidden rounded-lg transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
        <div
          className="relative h-full"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <img
            src={image}
            alt={imageAlt}
            className="w-full aspect-square lg:aspect-auto lg:h-[800px] object-cover transition-transform duration-300 hover:scale-105"
          />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Text content with staggered animation */}
      <div className={`flex-1 space-y-6 transition-all duration-700 delay-200 ${isVisible
          ? 'opacity-100 translate-x-0'
          : `opacity-0 ${imagePosition === 'right' ? '-translate-x-8' : 'translate-x-8'}`
        }`}>
        <h3 className="text-2xl lg:text-3xl font-light text-foreground leading-tight">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {content}
        </p>
        {/* Decorative line */}
        <div className={`h-px w-24 bg-primary/50 transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 w-24' : 'opacity-0 w-0'
          }`} />
      </div>
    </div>
  );
};

export default ImageTextBlock;