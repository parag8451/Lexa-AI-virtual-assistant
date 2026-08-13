import React, { memo } from "react";
import "./FluidAtmosphere.css";

/**
 * A highly optimized, purely CSS-based background component for Lexa AI.
 * It uses overlapping radial gradients with extreme blurs and long-duration
 * CSS keyframe animations (translate3d/scale) to create an organic, 
 * living fluid energy field that mimics the Google Stitch aesthetic 
 * without the overhead of WebGL or JS-driven rendering.
 */
export const FluidAtmosphere = memo(() => {
  return (
    <div className="fluid-atmosphere" aria-hidden="true">
      {/* 
        Independent layers with different color fields, positions, 
        and animation cycles to create non-repeating organic motion.
      */}
      <div className="fluid-layer fluid-layer-1" />
      <div className="fluid-layer fluid-layer-2" />
      <div className="fluid-layer fluid-layer-3" />
      <div className="fluid-layer fluid-layer-4" />
    </div>
  );
});

FluidAtmosphere.displayName = "FluidAtmosphere";

export default FluidAtmosphere;
