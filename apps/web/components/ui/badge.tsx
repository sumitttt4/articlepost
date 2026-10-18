"use client";

import * as React from "react";
import { Badge as KumoBadge } from "@cloudflare/kumo/components/badge";
import { cn } from "@/lib/utils";

export type BadgeProps = Omit<React.ComponentProps<typeof KumoBadge>, "variant"> & {
  variant?: React.ComponentProps<typeof KumoBadge>["variant"] | "default";
};
function Badge({ className, variant = "secondary", appearance, icon, ...props }: BadgeProps) {
  const mapped = variant === "default" ? "primary" : variant;
  if (appearance === "dot") return <KumoBadge variant={mapped} appearance="dot" className={cn("kumo-badge", className)} {...props} />;
  return <KumoBadge variant={mapped} appearance="filled" icon={icon} className={cn("kumo-badge", className)} {...props} />;
}
export { Badge };
