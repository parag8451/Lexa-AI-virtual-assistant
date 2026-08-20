import { useEffect, useRef } from 'react';

export default function PixelGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width: number, height: number;
    let animationFrameId: number;
    const pixelSize = 8;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let time = 0;

    function render() {
      ctx!.fillStyle = '#030308';
      ctx!.fillRect(0, 0, width, height);

      const cols = Math.ceil(width / pixelSize);
      const rows = Math.ceil(height / pixelSize);

      const arcCenterY = height * 0.4;
      const arcDrop = height * 0.9;
      const thickness = height * 0.35;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const px = x * pixelSize;
          const py = y * pixelSize;

          const nx = (px / width) * 2 - 1;
          const curveY = arcCenterY + Math.pow(Math.abs(nx), 1.8) * arcDrop;
          const distToCurve = Math.abs(py - curveY);

          let intensity = Math.max(0, 1 - distToCurve / thickness);

          if (intensity > 0.01) {
            const wave1 = Math.sin(nx * 4 - time * 1.5) * 0.1;
            const wave2 = Math.cos(py * 0.01 + time) * 0.1;
            intensity = Math.max(0, Math.min(1, intensity + wave1 + wave2));

            const edgeFade = 1 - Math.pow(Math.abs(nx), 2.5);
            intensity *= Math.max(0, edgeFade);

            if (intensity > 0.02) {
              const coreStr = Math.pow(intensity, 3);
              const midStr = Math.pow(intensity, 1.5);

              const r = Math.floor(40 * intensity + 150 * coreStr);
              const g = Math.floor(40 * intensity + 150 * coreStr);
              const b = Math.floor(220 * midStr + 35 * coreStr);

              ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`;
              ctx!.globalAlpha = intensity;
              ctx!.fillRect(px, py, pixelSize - 1, pixelSize - 1);
            }
          }
        }
      }

      ctx!.globalAlpha = 1.0;
      time += 0.02;
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
