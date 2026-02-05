import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useLandingPageSection } from "@/hooks/useLandingPageSections";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowRight } from "lucide-react";
import heroFallbackImage from "@/assets/hero-davala.jpg";

// Default hero videos
const defaultVideos = [
  "/hero-davala-video.mp4",
  "/hero-video-2.mp4",
  "/hero-video-3.mp4",
  "/hero-video-4.mp4",
];

const HeroSection = () => {
  const { data: section } = useLandingPageSection("hero");
  const { t, language } = useSettings();
  const [activeBuffer, setActiveBuffer] = useState(0); // 0 or 1
  const [videoIndices, setVideoIndices] = useState([0, 1]); // Buffer 0 index, Buffer 1 index
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState<Set<number>>(new Set());

  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>();

  // Use admin videos if set, otherwise defaults
  const videos = (section?.video_urls && section.video_urls.length > 0)
    ? section.video_urls
    : defaultVideos;

  // Content from database with language support
  const title = section?.title || "DAVALA";
  const subtitle = language === "bn" ? t("hero.elevate") : (section?.subtitle || "Elevate Your Everyday Radiance");
  const description = language === "bn" ? t("hero.tagline") : (section?.description || "Discover premium beauty essentials curated for all women");
  const ctaText = language === "bn" ? t("hero.shop_now") : (section?.cta_text || "Shop Now");
  const ctaLink = section?.cta_link || "/category/skincare";
  const backgroundImage = section?.image_url || heroFallbackImage;

  const SLOW_MOTION_RATE = 0.6; // Slightly faster for optimized cinematic feel

  // Manual src management to prevent remounts
  useEffect(() => {
    if (videoRef0.current && videos[videoIndices[0]]) {
      const targetSrc = videos[videoIndices[0]];
      if (!videoRef0.current.src.endsWith(targetSrc)) {
        videoRef0.current.src = targetSrc;
        videoRef0.current.defaultPlaybackRate = SLOW_MOTION_RATE;
        videoRef0.current.load();
        videoRef0.current.playbackRate = SLOW_MOTION_RATE;
        if (activeBuffer === 0) videoRef0.current.play().catch(() => { });
      }
    }
  }, [videoIndices[0], videos, activeBuffer]);

  useEffect(() => {
    if (videoRef1.current && videos[videoIndices[1]]) {
      const targetSrc = videos[videoIndices[1]];
      if (!videoRef1.current.src.endsWith(targetSrc)) {
        videoRef1.current.src = targetSrc;
        videoRef1.current.defaultPlaybackRate = SLOW_MOTION_RATE;
        videoRef1.current.load();
        videoRef1.current.playbackRate = SLOW_MOTION_RATE;
        if (activeBuffer === 1) videoRef1.current.play().catch(() => { });
      }
    }
  }, [videoIndices[1], videos, activeBuffer]);

  // Handle video loaded
  const handleVideoLoaded = useCallback((index: number) => {
    setVideosLoaded(prev => new Set(prev).add(index));
  }, []);

  // Seamless transition logic
  const triggerTransition = useCallback((targetIndex: number) => {
    if (videos.length <= 1 || isTransitioning) return;

    const nextBuffer = activeBuffer === 0 ? 1 : 0;
    const nextRef = nextBuffer === 0 ? videoRef0 : videoRef1;

    // 1. Prepare next buffer with target index
    setVideoIndices(prev => {
      const next = [...prev];
      next[nextBuffer] = targetIndex;
      return next;
    });

    // 2. Pre-roll next buffer
    if (nextRef.current) {
      nextRef.current.currentTime = 0;
      nextRef.current.defaultPlaybackRate = SLOW_MOTION_RATE;
      nextRef.current.playbackRate = SLOW_MOTION_RATE;
      nextRef.current.play().then(() => {
        // Wait a tiny bit for actual playback start to avoid first-frame flash
        setTimeout(() => {
          setIsTransitioning(true);

          // 4. Complete crossfade with premium duration (2000ms)
          setTimeout(() => {
            setActiveBuffer(nextBuffer);
            setIsTransitioning(false);

            // 5. Pre-load the sequence for the now-inactive buffer
            const nextNextIndex = (targetIndex + 1) % videos.length;
            setVideoIndices(prev => {
              const next = [...prev];
              next[activeBuffer] = nextNextIndex;
              return next;
            });
          }, 2000); // Perfect overlap
        }, 100);
      }).catch(console.error);
    }
  }, [activeBuffer, isTransitioning, videos]);

  // High-precision transition monitor (Stutter prevention)
  useEffect(() => {
    const checkTime = () => {
      const currentRef = activeBuffer === 0 ? videoRef0 : videoRef1;
      if (currentRef.current) {
        const video = currentRef.current;
        // Aggressively enforce slow motion
        if (video.playbackRate !== SLOW_MOTION_RATE) {
          video.playbackRate = SLOW_MOTION_RATE;
        }

        if (!isTransitioning) {
          // Trigger 2.5s (source time) before end. 
          // At 0.5x speed, 2.5s is actually 5s of real time.
          if (video.duration > 0 && video.duration - video.currentTime < 2.5) {
            const currentIndex = videoIndices[activeBuffer];
            const nextIndex = (currentIndex + 1) % videos.length;
            triggerTransition(nextIndex);
          }
        }
      }
      rafRef.current = requestAnimationFrame(checkTime);
    };

    rafRef.current = requestAnimationFrame(checkTime);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeBuffer, isTransitioning, videoIndices, videos.length, triggerTransition]);

  // Reset on video list change
  useEffect(() => {
    setActiveBuffer(0);
    setVideoIndices([0, 1 % videos.length]); // Ensure second index is valid if videos.length is 1
    setVideosLoaded(new Set());
    setIsTransitioning(false);
  }, [section?.video_urls, videos.length]);

  // Jump to specific video
  const goToVideo = useCallback((index: number) => {
    if (index === videoIndices[activeBuffer] || isTransitioning) return;
    triggerTransition(index);
  }, [activeBuffer, videoIndices, isTransitioning, triggerTransition]);

  const isFirstVideoLoaded = videosLoaded.has(videoIndices[activeBuffer]);

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[1200px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Container */}
      <div className="absolute inset-0">
        {/* Fallback Image - Instant View */}
        <img
          src={backgroundImage}
          alt="DAVALA"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 z-[3] ${isFirstVideoLoaded ? "opacity-0 invisible" : "opacity-100 visible"}`}
          loading="eager"
          fetchPriority="high"
        />

        {/* Triple-Layer Video Buffer */}
        {!videoError && (
          <>
            <video
              ref={videoRef0}
              muted
              playsInline
              onLoadedData={() => handleVideoLoaded(videoIndices[0])}
              onError={() => setVideoError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out z-[4] ${activeBuffer === 0 ? "opacity-100" : "opacity-0 invisible"}`}
              style={{ willChange: "opacity" }}
            />
            <video
              ref={videoRef1}
              muted
              playsInline
              onLoadedData={() => handleVideoLoaded(videoIndices[1])}
              onError={() => setVideoError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out z-[4] ${activeBuffer === 1 ? "opacity-100" : "opacity-0 invisible"}`}
              style={{ willChange: "opacity" }}
            />
          </>
        )}

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none z-[6]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-[7]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Brand Name */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[0.2em] sm:tracking-[0.4em] text-white mb-4 sm:mb-6 animate-fade-in drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          style={{
            animationDelay: "0.2s",
            textShadow: "0 2px 40px rgba(0,0,0,0.6), 0 0 80px rgba(255,255,255,0.1)"
          }}
        >
          {title}
        </h1>

        {/* Tagline */}
        <p
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white/95 mb-3 sm:mb-4 tracking-wide animate-fade-in italic"
          style={{
            animationDelay: "0.4s",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)"
          }}
        >
          {subtitle}
        </p>

        {/* Description */}
        <p
          className="text-xs sm:text-sm md:text-base font-light text-white/80 mb-8 sm:mb-10 max-w-md sm:max-w-xl mx-auto animate-fade-in px-4"
          style={{
            animationDelay: "0.6s",
            textShadow: "0 1px 10px rgba(0,0,0,0.5)"
          }}
        >
          {description}
        </p>

        {/* CTA Button */}
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/95 text-black text-xs sm:text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-white hover:gap-4 animate-fade-in group backdrop-blur-sm shadow-xl"
          style={{ animationDelay: "0.8s" }}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        {/* Video Progress Indicators */}
        {!videoError && videos.length > 1 && (
          <div className="flex justify-center gap-2 mt-8 sm:mt-10 animate-fade-in" style={{ animationDelay: "1s" }}>
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToVideo(index)}
                className={`h-1 rounded-full transition-all duration-500 ${index === videoIndices[activeBuffer]
                  ? "w-6 sm:w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
