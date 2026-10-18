"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="error-page"><h1>Something interrupted your workspace.</h1><p>Your locally saved drafts are still in this browser.</p><Button onClick={reset}>Try again</Button></div>; }
