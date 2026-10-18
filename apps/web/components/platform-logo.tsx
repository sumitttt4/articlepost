import Image from "next/image";
import { cn } from "@/lib/utils";

// Brand SVGs sourced from Simple Icons; served locally, not from a runtime CDN.
export function PlatformLogo({ platform, className }: {
  platform: "substack" | "medium" | "google";
  className?: string;
}) {
  return <Image src={`/logos/${platform}.svg`} width={24} height={24} alt="" aria-hidden="true" className={cn("platform-logo",className)} />;
}
