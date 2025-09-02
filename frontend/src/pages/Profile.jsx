export default function Profile() {
  return (
    <div className="container mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your account and saved layouts</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                JD
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">John Doe</h3>
                <p className="text-slate-600">john.doe@email.com</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
              Edit Profile
            </button>
          </div>

          {/* Account Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Account Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Layouts Created</span>
                <span className="font-semibold text-slate-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Stickers Printed</span>
                <span className="font-semibold text-slate-900">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Member Since</span>
                <span className="font-semibold text-slate-900">Jan 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Saved Layouts */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 text-lg">Saved Layouts</h3>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:opacity-90">
                Create New
              </button>
            </div>

            {/* Layout Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Layout Card 1 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">VS Code Shortcuts</h4>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">3×3</span>
                </div>
                
                {/* Mini Preview Grid */}
                <div className="grid grid-cols-3 gap-1 mb-4">
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘C</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘V</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘Z</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘S</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘P</span>
                  </div>
                  <div className="aspect-square bg-slate-50 rounded border-2 border-dashed border-slate-300"></div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:opacity-90">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                    Export
                  </button>
                </div>
              </div>

              {/* Layout Card 2 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Design Tools</h4>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">3×3</span>
                </div>
                
                {/* Mini Preview Grid */}
                <div className="grid grid-cols-3 gap-1 mb-4">
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">R</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">T</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘D</span>
                  </div>
                  <div className="aspect-square bg-slate-100 rounded text-xs flex items-center justify-center">
                    <span className="font-mono">⌘G</span>
                  </div>
                  <div className="aspect-square bg-slate-50 rounded border-2 border-dashed border-slate-300"></div>
                  <div className="aspect-square bg-slate-50 rounded border-2 border-dashed border-slate-300"></div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:opacity-90">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                    Export
                  </button>
                </div>
              </div>

              {/* Empty State Card */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-slate-400 text-2xl">+</span>
                </div>
                <p className="text-slate-600 mb-3">Create your first layout</p>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:opacity-90">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}