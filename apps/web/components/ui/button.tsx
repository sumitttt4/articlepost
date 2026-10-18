"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Button as KumoButton, buttonVariants as kumoButtonVariants } from "@cloudflare/kumo/components/button";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "destructive" | "secondary-destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "base" | "xs" | "sm" | "lg" | "icon";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  loading?: boolean;
}

const variantFor = (variant: Variant = "default") => variant === "default" ? "primary" : variant === "link" ? "ghost" : variant;
const sizeFor = (size: Size = "default") => size === "default" || size === "icon" ? "base" : size;

// Keep the existing call-site API while rendering Cloudflare's actual control.
function buttonVariants({ variant, size, className }: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn("button kumo-button", kumoButtonVariants({ variant: variantFor(variant), size: sizeFor(size) }), size === "icon" && "size-9 p-0", variant === "link" && "underline underline-offset-4", className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading, ...props }, ref) => {
    if (asChild) return <Slot ref={ref} className={buttonVariants({ variant, size, className })} {...props} />;
    return <KumoButton ref={ref} variant={variantFor(variant)} size={sizeFor(size)} loading={loading}
      className={cn("button kumo-button", size === "icon" && "size-9 p-0", variant === "link" && "underline underline-offset-4", className)} {...props} />;
  }
);
Button.displayName = "Button";
export { Button, buttonVariants };
