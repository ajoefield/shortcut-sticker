export default function SignUp(){
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Create account</h2>
      <form className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="First name" />
          <input className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Last name" />
        </div>
        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Email" />
        <input type="password" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Password" />
        <button className="w-full px-4 py-2 rounded-lg bg-white text-black font-medium">Create account</button>
      </form>
    </div>
  );
}
