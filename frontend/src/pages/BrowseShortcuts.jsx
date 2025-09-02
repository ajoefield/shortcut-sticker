export default function BrowseShortcuts() {
  return (
    <div className="container mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Shortcuts</h1>
        <p className="text-slate-600">Discover keyboard shortcuts for your favorite applications</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-2xl">
          <input 
            type="text" 
            placeholder="Search shortcuts by app name or shortcut key..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Filter Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">
            All Apps
          </button>
          <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
            Code Editors
          </button>
          <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
            Design Tools
          </button>
          <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
            Browsers
          </button>
          <button className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50">
            Productivity
          </button>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* VS Code Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              VS
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">VS Code</h3>
              <p className="text-sm text-slate-600">Code Editor</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Command Palette</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘⇧P</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Quick Open</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘P</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Toggle Terminal</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌃`</kbd>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Add to Layout
          </button>
        </div>

        {/* Figma Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Figma</h3>
              <p className="text-sm text-slate-600">Design Tool</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Rectangle Tool</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">R</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Text Tool</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">T</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Duplicate</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘D</kbd>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Add to Layout
          </button>
        </div>

        {/* Chrome Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Chrome</h3>
              <p className="text-sm text-slate-600">Browser</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">New Tab</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘T</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Close Tab</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘W</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Reload</span>
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘R</kbd>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Add to Layout
          </button>
        </div>
      </div>
    </div>
  );
}
