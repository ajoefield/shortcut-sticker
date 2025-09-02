export default function BrowseShortcuts(){
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Browse Shortcuts</h2>
      <p className="text-zinc-400">Static placeholder — later this will list apps and filters.</p>
      <div className="rounded-xl border border-white/10 p-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {["Photoshop","Illustrator","VS Code","Figma","Blender","Premiere"].map(name=>(
            <div key={name} className="rounded-lg border border-white/10 p-3">
              <div className="font-medium">{name}</div>
              <div className="text-xs text-zinc-400">Click to view shortcuts (coming soon)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
