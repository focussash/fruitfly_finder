// GameCanvas.tsx - Main game area component with responsive image and click detection

import { useState, useRef, useCallback, useEffect, type MouseEvent } from 'react';
import { Fly } from './Fly';
import type { Fly as FlyType } from '../../types/game';

interface GameCanvasProps {
  imageUrl?: string;
  flies?: FlyType[];
  onFlyClick?: (flyId: string, intensity: number) => void;
  onMiss?: (x: number, y: number) => void;
  onFlyEscapeComplete?: (flyId: string) => void;
  escapeDelays?: Record<string, number>;  // Staggered escape delays per fly
  debug?: boolean;
  children?: React.ReactNode;  // Overlay content (animations, etc.) positioned relative to image
}

interface ClickPosition {
  x: number;
  y: number;
  screenX: number;
  screenY: number;
}

interface ImageLayout {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export function GameCanvas({
  imageUrl,
  flies = [],
  onFlyClick,
  onMiss,
  onFlyEscapeComplete,
  escapeDelays = {},
  debug = false,
  children,
}: GameCanvasProps) {
  const [lastClick, setLastClick] = useState<ClickPosition | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the actual rendered image layout (accounting for object-fit: contain)
  const calculateImageLayout = useCallback((): ImageLayout | null => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container || !imageLoaded) return null;

    const containerRect = container.getBoundingClientRect();
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const naturalAspect = naturalWidth / naturalHeight;
    const containerAspect = containerWidth / containerHeight;

    let renderedWidth: number;
    let renderedHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (naturalAspect > containerAspect) {
      renderedWidth = containerWidth;
      renderedHeight = containerWidth / naturalAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderedHeight) / 2;
    } else {
      renderedHeight = containerHeight;
      renderedWidth = containerHeight * naturalAspect;
      offsetX = (containerWidth - renderedWidth) / 2;
      offsetY = 0;
    }

    return { offsetX, offsetY, width: renderedWidth, height: renderedHeight };
  }, [imageLoaded]);

  const handleCanvasClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const layout = calculateImageLayout();
    const container = containerRef.current;
    if (!layout || !container) return;

    const containerRect = container.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    // Calculate position relative to the actual image content
    const relativeX = clickX - layout.offsetX;
    const relativeY = clickY - layout.offsetY;

    // Convert to percentage (0-100)
    const percentX = (relativeX / layout.width) * 100;
    const percentY = (relativeY / layout.height) * 100;

    // Check if click is within the image bounds
    const isWithinImage =
      relativeX >= 0 &&
      relativeX <= layout.width &&
      relativeY >= 0 &&
      relativeY <= layout.height;

    if (isWithinImage) {
      const clampedX = Math.max(0, Math.min(100, percentX));
      const clampedY = Math.max(0, Math.min(100, percentY));

      setLastClick({
        x: clampedX,
        y: clampedY,
        screenX: clickX,
        screenY: clickY,
      });

      // This is a miss (clicking on empty canvas, not on a fly)
      // Fly clicks are handled by the Fly component with stopPropagation
      onMiss?.(clampedX, clampedY);
    }
  }, [calculateImageLayout, onMiss]);

  const handleFlyClick = useCallback((flyId: string, intensity: number) => {
    onFlyClick?.(flyId, intensity);
  }, [onFlyClick]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Recalculate layout after image loads
    const layout = calculateImageLayout();
    setImageLayout(layout);
  }, [calculateImageLayout]);

  // Check if image is already loaded (cached) on mount
  useEffect(() => {
    const img = imageRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
      const layout = calculateImageLayout();
      setImageLayout(layout);
    }
  }, [calculateImageLayout]);

  // Update layout on window resize
  const updateLayout = useCallback(() => {
    if (imageLoaded) {
      const layout = calculateImageLayout();
      setImageLayout(layout);
    }
  }, [imageLoaded, calculateImageLayout]);

  // Default placeholder image for testing
  const displayUrl = imageUrl || 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800&q=80';

  // Calculate fly container position and size to match the actual image area
  const flyContainerStyle = imageLayout ? {
    left: `${imageLayout.offsetX}px`,
    top: `${imageLayout.offsetY}px`,
    width: `${imageLayout.width}px`,
    height: `${imageLayout.height}px`,
  } : {};

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black/20 rounded-lg overflow-hidden cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseEnter={updateLayout}
    >
      <img
        ref={imageRef}
        src={displayUrl}
        alt="Game scene"
        className="w-full h-full object-contain"
        onLoad={handleImageLoad}
        draggable={false}
      />

      {/* Fly container - positioned to match the actual rendered image area */}
      {imageLoaded && imageLayout && (
        <div
          className="absolute pointer-events-none"
          style={flyContainerStyle}
        >
          {/* Flies rendered with pointer-events-auto so they can be clicked */}
          <div className="relative w-full h-full pointer-events-auto">
            {flies.map((fly) => (
              <Fly
                key={fly.id}
                id={fly.id}
                x={fly.x}
                y={fly.y}
                size={fly.size}
                found={fly.found}
                escaped={fly.escaped}
                escapeDelay={escapeDelays[fly.id] || 0}
                onClick={handleFlyClick}
                onEscapeComplete={onFlyEscapeComplete}
                debug={debug}
              />
            ))}
          </div>
          {/* Overlay content (animations, popups) - also positioned relative to image */}
          {children}
        </div>
      )}

      {/* Debug overlay */}
      {debug && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-sm px-3 py-2 rounded font-mono">
          <div>Image loaded: {imageLoaded ? 'Yes' : 'No'}</div>
          <div>Flies: {flies.length} (found: {flies.filter(f => f.found).length})</div>
          {lastClick && (
            <>
              <div>Last click: ({lastClick.x.toFixed(1)}%, {lastClick.y.toFixed(1)}%)</div>
            </>
          )}
          {!lastClick && <div>Click anywhere on the image</div>}
        </div>
      )}

      {/* Visual marker at last click position */}
      {debug && lastClick && imageLoaded && (
        <div
          className="absolute w-4 h-4 pointer-events-none"
          style={{
            left: `${lastClick.screenX}px`,
            top: `${lastClick.screenY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="absolute w-full h-0.5 bg-red-500 top-1/2 -translate-y-1/2" />
          <div className="absolute h-full w-0.5 bg-red-500 left-1/2 -translate-x-1/2" />
          <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
}
