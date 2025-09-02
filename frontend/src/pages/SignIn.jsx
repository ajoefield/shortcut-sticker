export default function SignIn(){
  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-600">Welcome back to HandsOnKeyboard</p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input 
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300" 
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300" 
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full px-6 py-4 rounded-xl bg-slate-900 text-white font-bold text-lg border-4 border-slate-900 transition-all shadow-lg"
            style={{ transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#64748b';
              e.target.style.borderColor = '#64748b';
            }}
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-slate-900 font-semibold hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}