export default function Success(){
  return (
    <div className="max-w-lg mx-auto text-center space-y-4">
      <h2 className="text-3xl font-semibold">Account created 🎉</h2>
      <p className="text-zinc-300">You’re all set. Explore shortcuts or visit your profile.</p>
      <div className="flex gap-3 justify-center">
        <a href="/browse" className="px-4 py-2 rounded-xl bg-white text-black font-medium">Browse</a>
        <a href="/profile" className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">Profile</a>
      </div>
    </div>
  );
}
