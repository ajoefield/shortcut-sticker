import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../shell/AppShell';

export default function Landing() {
  const [activeSize, setActiveSize] = useState('3x3');
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useDarkMode();

  const PRESETS = {
    '3x3': { label: '3.00 × 3.00 in', cols: 3, rows: 3, capacity: 9 },
    '3_75': { label: '3.75 × 3.75 in', cols: 4, rows: 4, capacity: 16 },
    'mousepad': { label: 'Mousepad', cols: 6, rows: 7, capacity: 42 },
  };

  const EXAMPLE_SHORTCUTS = [
    { k: '⌘ + B', v: 'Bold' },
    { k: '⌘ + /', v: 'Toggle comment' },
    { k: '⌥ + ↑/↓', v: 'Move line' },
    { k: 'G G', v: 'Go to top' },
    { k: '⌘ + P', v: 'Command palette' },
    { k: '⌘ + D', v: 'Multi‑cursor' },
  ];

  const currentPreset = PRESETS[activeSize];
  const gridCols = currentPreset.cols;
  const totalTiles = Math.max(currentPreset.capacity, EXAMPLE_SHORTCUTS.length);

  return (
    <div style={{
      background: isDarkMode 
        ? '#0b0f1a'
        : `radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), 
           linear-gradient(to bottom, #ffffff, transparent 40%), 
           #ffffff`,
      color: isDarkMode ? '#e5e7eb' : '#0f172a',
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        padding: '0 20px',
        margin: '0 auto',
        display: 'grid',
        gap: '32px',
        padding: '64px 20px',
        gridTemplateColumns: window.innerWidth >= 992 ? '1fr 1fr' : '1fr',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(28px, 4.2vw, 46px)',
            lineHeight: '1.05',
            margin: '0',
            fontWeight: '900',
            letterSpacing: '-0.02em'
          }}>
            Build custom{' '}
            <span style={{
              background: 'linear-gradient(90deg, #0f172a, #64748b)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              keyboard‑shortcut
            </span>
            {' '}stickers in minutes.
          </h1>
          <p style={{
            marginTop: '14px',
            fontSize: '18px',
            color: isDarkMode ? '#9ca3af' : '#475569',
            maxWidth: '60ch'
          }}>
            Pick a layout size, add shortcuts from the Library, and export a print‑perfect sticker for your laptop palm rest—or a full mousepad.
          </p>

          {/* Size chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px'
          }} role="group" aria-label="Layout sizes">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setActiveSize(key)}
                style={{
                  borderRadius: '999px',
                  padding: '6px 12px',
                  fontWeight: '600',
                  border: '1px solid #e2e8f0',
                  background: activeSize === key ? '#0f172a' : '#ffffff',
                  color: activeSize === key ? '#ffffff' : '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px'
          }}>
            <Link to="/create" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#0f172a',
              color: '#fff',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Create your layout
            </Link>
            <Link to="/browse" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Browse shortcuts
            </Link>
          </div>

          {/* Search mock */}
          <div style={{ marginTop: '24px', maxWidth: '520px' }}>
            <label style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#475569' }}>Try it: search an app</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., VS Code, Blender, Photoshop"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              />
              <button style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Search
              </button>
            </div>
            <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#475569', marginTop: '8px' }}>
              Results appear in the Shortcut Library. Click to add—no drag‑and‑drop needed.
            </p>
          </div>
        </div>

        <div>
          <section style={{
            background: `${isDarkMode ? '#1f2937' : '#ffffff'} !important`,
            border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <div style={{ color: isDarkMode ? '#9ca3af' : '#475569', fontWeight: '600' }}>Live Preview (mock)</div>
              <span style={{
                display: 'inline-block',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                padding: '3px 8px',
                fontSize: '12px'
              }}>
                {currentPreset.label}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              background: '#ffffff',
              padding: '10px',
              minHeight: '220px'
            }}>
              {Array.from({ length: totalTiles }, (_, i) => {
                const shortcut = EXAMPLE_SHORTCUTS[i];
                return (
                  <div
                    key={i}
                    style={{
                      border: shortcut ? '1px solid #e2e8f0' : '1px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '8px',
                      fontSize: '12px',
                      background: shortcut ? 'color-mix(in oklab, #ffffff 80%, #ffffff)' : 'transparent',
                      color: shortcut ? '#0f172a' : '#94a3b8',
                      display: shortcut ? 'block' : 'grid',
                      placeItems: shortcut ? 'normal' : 'center'
                    }}
                  >
                    {shortcut ? (
                      <>
                        <div style={{ fontWeight: '700', lineHeight: '1.1' }}>{shortcut.k}</div>
                        <div style={{ color: '#475569', marginTop: '2px' }}>{shortcut.v}</div>
                      </>
                    ) : (
                      'ghost'
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#475569', marginTop: '10px' }}>
              Ghost grid shows capacity; add too many and tiles scale down.
            </div>
          </section>

          {/* Features */}
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(3, minmax(0, 1fr))' : '1fr'
          }}>
            <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
              <span>🖥️</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>macOS & Windows</div>
                <span style={{ color: '#475569' }}>Cross‑platform shortcuts with clear OS labels.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
              <span>🏷️</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Print‑ready output</div>
                <span style={{ color: '#475569' }}>High‑DPI layouts tuned for palm‑rest stickers.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
              <span>✨</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Clean UI flow</div>
                <span style={{ color: '#475569' }}>From Library → Canvas → Preview in a few clicks.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: '1200px',
        padding: '0 20px',
        margin: '0 auto',
        marginTop: '56px'
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 3.2vw, 32px)',
          margin: '0',
          fontWeight: '800'
        }}>
          How it works
        </h2>
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569', marginTop: '6px' }}>
          A clean, linear flow inspired by your Excalidraw sketch.
        </p>
        <div style={{
          display: 'grid',
          gap: '14px',
          marginTop: '16px',
          gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(4, minmax(0, 1fr))' : '1fr'
        }}>
          {[
            { num: 1, title: 'Choose your app(s)', desc: 'Browse the Shortcut Library and pick the tools you use most.' },
            { num: 2, title: 'Select a layout size', desc: '3.0×3.0, 3.75×3.75, or mousepad. Real‑world scaling built in.' },
            { num: 3, title: 'Click to add shortcuts', desc: 'Build your layout, then organize on the canvas grid.' },
            { num: 4, title: 'Preview & checkout', desc: 'Export print‑ready or order a vinyl sticker.' }
          ].map((step) => (
            <div key={step.num} style={{
              border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              background: `${isDarkMode ? '#1f2937' : '#ffffff'} !important`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700'
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '999px',
                  display: 'grid',
                  placeItems: 'center',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '12px'
                }}>
                  {step.num}
                </span>
                {step.title}
              </div>
              <p style={{ color: isDarkMode ? '#9ca3af' : '#475569', margin: '8px 0 0' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: '64px',
        padding: '24px 0 56px',
        color: '#475569',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          padding: '0 20px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>© {new Date().getFullYear()} Shortcut Designer</div>
          <nav style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <Link to="/browse" style={{ color: 'inherit', textDecoration: 'none' }}>Templates</Link>
            <a href="#how" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
            <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
