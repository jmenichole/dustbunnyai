import Image from "next/image";

export function BunnyAvatar({ cleaning = false, size = 72 }: { cleaning?: boolean; size?: number }) {
  return (
    <div className="inline-block">
      <Image
        src="/brand/mascot-clean.png"
        alt="DustBunny avatar"
        width={size}
        height={size - 10}
        sizes="(max-width: 640px) 48px, (max-width: 1024px) 60px, 72px"
        className={cleaning ? "animate-pulse" : ""}
        priority
      />
    </div>
  );
}
