declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flat?: boolean;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: ('square' | 'circle' | 'star' | Shape)[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
    scalar?: number;
  }

  interface Shape {
    type: string;
    [key: string]: unknown;
  }

  interface ShapeFromTextOptions {
    text: string;
    scalar?: number;
    fontFamily?: string;
  }

  function confetti(options?: Options): Promise<null>;

  namespace confetti {
    function shapeFromText(options: ShapeFromTextOptions): Shape;
    function reset(): void;
  }

  export = confetti;
}
