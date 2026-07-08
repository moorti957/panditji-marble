export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ivory dark:bg-brown">
      <div className="flex flex-col items-center justify-center">
        {/* Golden Ring */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-gold/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
        </div>

        {/* Brand */}
        <div className="mt-6 text-center">
          <h1 className="font-cinzel text-2xl font-bold text-brown dark:text-white">
            PANDIT JI MARBLE <span className="text-gold-dark">MURTI ART</span>
          </h1>

          <p className="mt-2 text-sm text-brown-light dark:text-white/70 animate-pulse">
            Loading divine collection...
          </p>
        </div>
      </div>
    </div>
  );
}