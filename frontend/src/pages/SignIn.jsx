export default function SignIn(){
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <form className="space-y-3">
        <input className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Email" />
        <input type="password" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" placeholder="Password" />
        <button className="w-full px-4 py-2 rounded-lg bg-white text-black font-medium">Continue</button>
      </form>
      <p className="text-sm text-zinc-400">No account? <a className="underline" href="/signup">Create one</a></p>
    </div>
  );
}
