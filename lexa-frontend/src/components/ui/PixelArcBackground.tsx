import { useEffect, useRef } from "react";

function PixelArcBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animationFrame = 0;
    const pixelSize = 8;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, width, height);

      const cols = Math.ceil(width / pixelSize);
      const rows = Math.ceil(height / pixelSize);
      const arcCenterY = height * 0.4;
      const arcDrop = height * 0.9;
      const thickness = height * 0.35;

      for (let x = 0; x < cols; x += 1) {
        for (let y = 0; y < rows; y += 1) {
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
              const coreStrength = Math.pow(intensity, 3);
              const middleStrength = Math.pow(intensity, 1.5);
              const red = Math.floor(40 * intensity + 150 * coreStrength);
              const green = Math.floor(40 * intensity + 150 * coreStrength);
              const blue = Math.floor(220 * middleStrength + 35 * coreStrength);

              ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
              ctx.globalAlpha = intensity;
              ctx.fillRect(px, py, pixelSize - 1, pixelSize - 1);
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      time += reducedMotion ? 0 : 0.02;
      animationFrame = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pixel-arc-background" aria-hidden="true" />;
}

const features = [
  ["01", "Think in context", "Lexa holds the thread across research, creation, communication, and code."],
  ["02", "Move with signal", "Turn scattered inputs into a clear next move without leaving your flow."],
  ["03", "Keep your edge", "A private intelligence layer designed around the work that matters."],
];

export default function Landing() {
  return (
    <main className="landing-page">
      <PixelArcBackground />

      <nav className="landing-nav">
        <a className="wordmark" href="#top" aria-label="Lexa home">
          <span className="wordmark-orbit" aria-hidden="true" />
          <span>lexa<span className="wordmark-accent">a</span></span>
        </a>
        <div className="landing-nav-links">
          <a href="#signal">Signal</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#about">About</a>
        </div>
        <a className="nav-button" href="#start">Try Lexa <span aria-hidden="true">↗</span></a>
      </nav>

      <section id="top" className="landing-hero">
        <div className="hero-eyebrow"><span /> INTELLIGENCE, WITH A MEMORY</div>
        <h1>Think across<br /><em>the whole signal.</em></h1>
        <p className="hero-copy">
          Lexa is the quiet intelligence layer for the work that matters.
          Research, create, communicate, and code—without losing the thread.
        </p>
        <div className="hero-actions" id="start">
          <a className="primary-button" href="#signal">Put it in motion <span aria-hidden="true">→</span></a>
          <a className="text-button" href="#capabilities">Explore the system <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-readout"><span><i /> PRIVATE BY DEFAULT</span><span>LEXA / 001</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section id="signal" className="signal-section content-section">
        <div className="section-label">/ THE PREMISE</div>
        <div className="section-grid">
          <h2>More than a chat.<br /><span>A second layer of thought.</span></h2>
          <div>
            <p>The best tools disappear into the work. Lexa stays close enough to notice patterns, hold context, and surface the move you have not made yet.</p>
            <a className="text-button" href="#capabilities">Meet your thinking layer <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section id="capabilities" className="capabilities-section content-section">
        <div className="section-label">/ CAPABILITIES</div>
        <h2>Built for the<br /><em>whole arc.</em></h2>
        <div className="feature-list">
          {features.map(([number, title, copy]) => (
            <article className="feature-row" key={number}>
              <span className="feature-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="feature-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="closing-section content-section">
        <div className="section-label">/ THE NEXT SIGNAL</div>
        <h2>Keep the thought<br /><em>moving.</em></h2>
        <a className="primary-button" href="#top">Try Lexa free <span aria-hidden="true">→</span></a>
      </section>

      <footer className="landing-footer">
        <span>LEXA AI</span>
        <span>INTELLIGENCE, WITH A MEMORY</span>
        <span>© 2026 LEXA SYSTEMS</span>
      </footer>

      <style>{`
        :root {
          color-scheme: dark;
          --bg: #030308;
          --surface: rgba(9, 10, 20, .72);
          --line: rgba(166, 170, 255, .18);
          --muted: #9a9aaf;
          --text: #f4f3ff;
          --accent: #9b9cff;
          --accent-bright: #c0c0ff;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        a { color: inherit; text-decoration: none; }
        .landing-page { min-height: 100vh; position: relative; overflow: hidden; background: radial-gradient(circle at 50% 10%, rgba(45, 42, 122, .18), transparent 34%), var(--bg); }
        .pixel-arc-background { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; opacity: .9; }
        .landing-page::after { content: ""; position: fixed; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(90deg, rgba(3,3,8,.92), transparent 45%, rgba(3,3,8,.18)), linear-gradient(0deg, rgba(3,3,8,.92), transparent 42%, rgba(3,3,8,.28)); }
        .landing-nav, .landing-hero, .content-section, .landing-footer { position: relative; z-index: 2; }
        .landing-nav { min-height: 78px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 6vw, 92px); border-bottom: 1px solid var(--line); background: rgba(3,3,8,.34); backdrop-filter: blur(14px); }
        .wordmark { display: inline-flex; align-items: center; gap: 12px; font-size: 1.2rem; font-weight: 700; letter-spacing: -.08em; }
        .wordmark-orbit { width: 27px; height: 27px; display: inline-block; border: 1px solid var(--accent); border-radius: 50%; box-shadow: inset 7px 0 var(--bg), 0 0 16px rgba(155,156,255,.45); }
        .wordmark-accent, em { color: var(--accent-bright); font-style: normal; }
        .landing-nav-links { display: flex; gap: clamp(18px, 3vw, 48px); color: var(--muted); font-family: ui-monospace, SFMono-Regular, monospace; font-size: .64rem; letter-spacing: .12em; text-transform: uppercase; }
        .landing-nav-links a, .text-button, .nav-button, .primary-button { transition: color .2s ease, background .2s ease, transform .2s ease, border-color .2s ease; }
        .landing-nav-links a:hover, .text-button:hover { color: var(--accent-bright); }
        .nav-button, .primary-button { display: inline-flex; align-items: center; gap: 12px; border: 1px solid rgba(192,192,255,.5); padding: 12px 16px; background: rgba(155,156,255,.1); font-family: ui-monospace, SFMono-Regular, monospace; font-size: .65rem; letter-spacing: .08em; text-transform: uppercase; }
        .nav-button:hover, .primary-button:hover { background: rgba(155,156,255,.24); transform: translateY(-2px); }
        .landing-hero { min-height: min(860px, 92vh); display: flex; flex-direction: column; justify-content: center; padding: 140px clamp(20px, 9vw, 150px) 110px; }
        .hero-eyebrow, .section-label, .hero-readout, .landing-footer { color: var(--accent-bright); font-family: ui-monospace, SFMono-Regular, monospace; font-size: .64rem; letter-spacing: .14em; text-transform: uppercase; }
        .hero-eyebrow span { display: inline-block; width: 46px; height: 1px; margin-right: 12px; vertical-align: middle; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
        .landing-hero h1 { max-width: 780px; margin: 28px 0 0; font-size: clamp(4rem, 10vw, 9.5rem); line-height: .84; letter-spacing: -.1em; }
        .hero-copy { max-width: 470px; margin-top: 34px; color: #c6c4d8; font-size: clamp(1rem, 1.5vw, 1.15rem); line-height: 1.7; }
        .hero-actions { display: flex; align-items: center; gap: 24px; margin-top: 38px; }
        .text-button { display: inline-flex; align-items: center; gap: 10px; color: #bebdd2; font-family: ui-monospace, SFMono-Regular, monospace; font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; }
        .hero-readout { display: flex; flex-wrap: wrap; gap: 28px; margin-top: 92px; color: #8b8aa0; }
        .hero-readout i { display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: #a4e4bc; box-shadow: 0 0 12px #a4e4bc; }
        .content-section { padding: clamp(110px, 15vw, 220px) clamp(20px, 9vw, 150px); border-top: 1px solid var(--line); background: linear-gradient(180deg, rgba(5,5,16,.65), rgba(3,3,8,.82)); }
        .section-label { color: var(--accent); }
        .section-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr); gap: 12%; margin-top: 30px; }
        .content-section h2 { margin: 0; font-size: clamp(3.2rem, 7vw, 7rem); line-height: .9; letter-spacing: -.09em; }
        .section-grid p { max-width: 420px; margin: 10px 0 32px; color: var(--muted); font-size: 1.05rem; line-height: 1.7; }
        .capabilities-section > h2 { margin-top: 28px; }
        .feature-list { margin-top: 72px; border-top: 1px solid var(--line); }
        .feature-row { display: grid; grid-template-columns: 58px 1fr 1.5fr 28px; gap: 22px; align-items: center; padding: 28px 0; border-bottom: 1px solid var(--line); }
        .feature-row:hover { background: rgba(155,156,255,.06); }
        .feature-number, .feature-arrow { color: var(--accent); font-family: ui-monospace, SFMono-Regular, monospace; font-size: .7rem; }
        .feature-row h3 { margin: 0; font-size: 1.4rem; letter-spacing: -.04em; }
        .feature-row p { margin: 0; color: var(--muted); line-height: 1.6; }
        .feature-arrow { justify-self: end; }
        .closing-section { min-height: 680px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .closing-section h2 { margin-top: 28px; }
        .closing-section .primary-button { margin-top: 42px; }
        .landing-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 20px; padding: 36px clamp(20px, 9vw, 150px); border-top: 1px solid var(--line); color: #8b8aa0; }
        :focus-visible { outline: 2px solid var(--accent-bright); outline-offset: 4px; }
        @media (max-width: 760px) {
          .landing-nav-links { display: none; }
          .landing-hero { min-height: 780px; padding-top: 120px; }
          .landing-hero h1 { font-size: clamp(3.6rem, 17vw, 6rem); }
          .hero-actions { align-items: flex-start; flex-direction: column; }
          .section-grid { grid-template-columns: 1fr; gap: 36px; }
          .feature-row { grid-template-columns: 36px 1fr 22px; gap: 12px; }
          .feature-row p { grid-column: 2 / 4; }
          .landing-footer { flex-direction: column; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .landing-nav-links a, .text-button, .nav-button, .primary-button { transition: none; }
        }
      `}</style>
    </main>
  );
}
