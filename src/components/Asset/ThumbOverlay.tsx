import { cn } from "@/lib/utils";

type ThumbOverlayProps = {
  src: string | null;
  hidden: boolean;
};

export function ThumbOverlay({ src, hidden }: ThumbOverlayProps) {
  if (!src) return null;

  return (
    <img
      src={src}
      aria-hidden
      className={cn(
        "absolute inset-0 h-full w-full object-cover blur-xl transition-opacity duration-300 ease-in-out",
        hidden ? "opacity-0" : "opacity-100",
      )}
    />
  );
}
