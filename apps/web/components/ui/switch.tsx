"use client";
import * as React from "react";
import { Switch as KumoSwitch } from "@cloudflare/kumo/components/switch";

// Retire the legacy thumb/track overrides; Kumo owns its checked-state styling.
const Switch = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof KumoSwitch>>(
  ({ className, ...props }, ref) => <KumoSwitch ref={ref} className={className?.split(" ").filter(c=>c!=="switch").join(" ")} {...props} />
);
Switch.displayName = "Switch";
export { Switch };
