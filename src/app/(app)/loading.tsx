export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-4 text-center">
        <div className="size-8 border-2 border-champagne/30 border-t-champagne rounded-full animate-spin mx-auto" />
        <p className="text-label text-ivory/30">Loading...</p>
      </div>
    </div>
  );
}
