export default function Landing() {
  return (
    <section className="container mx-auto px-5 py-16 lg:py-24 relative">
      {/* Auth buttons - top right */}
      <div className="fixed top-20 right-8 flex gap-3 z-40">
        <a href="/signin" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-colors text-sm">
          Sign In
        </a>
        <a href="/signup" className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-90 transition-opacity text-sm">
          Sign Up
        </a>
      </div>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
            Build custom{" "}
            <span 
              style={{
                background: 'linear-gradient(90deg, #0f172a, #64748b)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              keyboard‑shortcut
            </span>{" "}
            stickers in minutes.
          </h1>
          <p className="text-lg text-slate-600 mb-6 max-w-prose">
            Pick a layout size, add shortcuts from the Library, and export a print‑perfect sticker for your laptop palm rest—or a full mousepad.
          </p>

          {/* Size chips */}
          <div className="flex flex-wrap gap-3 mb-4" role="group" aria-label="Layout sizes">
            <button className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-900 text-white font-semibold text-sm">
              3.00 × 3.00 in
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
              3.75 × 3.75 in
            </button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
              Mousepad
            </button>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <a href="/create" className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:opacity-90">
              Create your layout
            </a>
            <a href="/browse" className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50">
              Browse shortcuts
            </a>
          </div>

          {/* Search mock */}
          <div className="max-w-lg">
            <label className="block text-xs text-slate-600 mb-2">Try it: search an app</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900" 
                placeholder="e.g., VS Code, Blender, Photoshop" 
              />
              <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50">
                Search
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Results appear in the Shortcut Library. Click to add—no drag‑and‑drop needed.
            </p>
          </div>


        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-600 font-semibold text-sm">Live Preview (mock)</div>
              <span className="px-2 py-1 text-xs border border-slate-200 rounded-full">3.00 × 3.00 in</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 border border-slate-200 rounded-xl bg-white p-2.5 min-h-[220px]">
              {/* Sample tiles */}
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                <div className="font-bold text-xs leading-tight">⌘C</div>
                <div className="text-slate-600 text-xs mt-0.5">Copy</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                <div className="font-bold text-xs leading-tight">⌘V</div>
                <div className="text-slate-600 text-xs mt-0.5">Paste</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                <div className="font-bold text-xs leading-tight">⌘Z</div>
                <div className="text-slate-600 text-xs mt-0.5">Undo</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                <div className="font-bold text-xs leading-tight">⌘S</div>
                <div className="text-slate-600 text-xs mt-0.5">Save</div>
              </div>
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                <div className="font-bold text-xs leading-tight">⌘A</div>
                <div className="text-slate-600 text-xs mt-0.5">Select All</div>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 bg-transparent text-slate-400 text-xs flex items-center justify-center">
                +
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
