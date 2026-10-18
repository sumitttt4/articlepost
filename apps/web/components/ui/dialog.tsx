"use client";

import * as React from "react";
import { Dialog as KumoDialog } from "@cloudflare/kumo/components/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dialog = KumoDialog.Root;
const DialogTitle = KumoDialog.Title;
const DialogDescription = KumoDialog.Description;

function DialogClose({ asChild, children, ...props }: React.ComponentProps<typeof KumoDialog.Close> & {asChild?:boolean}) {
  return <KumoDialog.Close {...props} render={asChild && React.isValidElement(children) ? children : undefined}>{asChild ? undefined : children}</KumoDialog.Close>;
}
function DialogContent({className,children,...props}: React.ComponentProps<typeof KumoDialog>) {
  return <KumoDialog {...props} size="lg" className={cn("kumo-dialog",className)}>
    {children}
    <KumoDialog.Close aria-label="Close" render={<Button variant="ghost" size="icon" className="dialog-close" aria-label="Close"><X/></Button>}/>
  </KumoDialog>;
}
function DialogHeader({className,...props}:React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5",className)} {...props}/>;
}
function DialogFooter({className,...props}:React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-2",className)} {...props}/>;
}
export { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader, DialogFooter };
