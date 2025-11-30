import Image from "next/image";

export function BunnyLoader({ size = "lg" }: { size?: "sm" | "lg" }) {
  const dims = size === "sm" ? { w: 64, h: 56 } : { w: 128, h: 112 };
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-bounce mb-3">
        <Image
          src="/brand/mascot-clean.png"
          alt="DustBunny loading"
          width={dims.w}
          height={dims.h}
          sizes="(max-width: 640px) 64px, (max-width: 1024px) 96px, 128px"
          className="drop-shadow-md"
          priority
        />
      </div>
      <div className="text-sm md:text-lg text-gray-600">
        DustBunny is working...
      </div>
    </div>
  );
}
