export default function Landing(){
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 text-xs text-zinc-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          New • Custom shortcut stickers
        </div>
        <h1 className="text-4xl font-black leading-tight">
          Design your own <span className="text-white/90">shortcut sticker</span>.
        </h1>
        <p className="text-lg text-zinc-300 max-w-prose">
          Pick a size, choose your apps, and personalize a printable layout for your laptop palm rest or mousepad.
        </p>
        <div className="flex gap-3">
          <a href="/browse" className="px-4 py-2 rounded-xl bg-white text-black font-medium">Browse Shortcuts</a>
          <a href="/signup" className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">Get Started</a>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="aspect-[4/3] rounded-xl bg-white/5 grid place-items-center">
          <span className="text-zinc-400">Hero Preview Area</span>
        </div>
      </div>
    </section>
  );
}
