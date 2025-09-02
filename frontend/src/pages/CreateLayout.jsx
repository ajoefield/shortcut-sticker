export default function CreateLayout() {
  return (
    <div className="container mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Layout</h1>
        <p className="text-slate-600">Design your custom shortcut sticker layout</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Size & Options */}
        <div className="space-y-6">
          {/* Size Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Layout Size</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="size" className="text-slate-900" defaultChecked />
                <span className="text-slate-700">3.00 × 3.00 in (9 shortcuts)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="size" className="text-slate-900" />
                <span className="text-slate-700">3.75 × 3.75 in (16 shortcuts)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="size" className="text-slate-900" />
                <span className="text-slate-700">Mousepad (42 shortcuts)</span>
              </label>
            </div>
          </div>

          {/* Selected Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Selected Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Copy</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘C</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Paste</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘V</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Undo</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">⌘Z</kbd>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              + Add More Shortcuts
            </button>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Layout Preview</h3>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">3.00 × 3.00 in</span>
            </div>
            
            {/* Grid Canvas */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50">
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {/* Filled Shortcuts */}
                <div className="aspect-square border border-slate-200 rounded-lg bg-white p-3 flex flex-col justify-center items-center shadow-sm">
                  <div className="font-bold text-sm text-slate-900">⌘C</div>
                  <div className="text-xs text-slate-600 mt-1">Copy</div>
                </div>
                <div className="aspect-square border border-slate-200 rounded-lg bg-white p-3 flex flex-col justify-center items-center shadow-sm">
                  <div className="font-bold text-sm text-slate-900">⌘V</div>
                  <div className="text-xs text-slate-600 mt-1">Paste</div>
                </div>
                <div className="aspect-square border border-slate-200 rounded-lg bg-white p-3 flex flex-col justify-center items-center shadow-sm">
                  <div className="font-bold text-sm text-slate-900">⌘Z</div>
                  <div className="text-xs text-slate-600 mt-1">Undo</div>
                </div>
                
                {/* Empty Slots */}
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:opacity-90">
                Preview & Export
              </button>
              <button className="px-6 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}