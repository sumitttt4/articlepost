"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";
import { DatePicker } from "@cloudflare/kumo/components/date-picker";
import { Select } from "@cloudflare/kumo/components/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const pad = (n: number) => String(n).padStart(2, "0");
function parse(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
const serialize = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function DateTimePicker({value,onChange,label="Planned time",placeholder="No time set",id}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}) {
  const [open,setOpen] = useState(false);
  const selected = parse(value);
  const hour = selected?.getHours() ?? 9;
  const minute = selected?.getMinutes() ?? 0;
  const display = selected?.toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}) ?? placeholder;

  const pickDay = (date: Date | undefined) => {
    if (!date) return;
    const next = new Date(date);
    next.setHours(hour,minute,0,0);
    onChange(serialize(next));
  };
  const pickTime = (h: number, m: number) => {
    // Choosing a time first uses today, not the first day of a past month.
    const next = selected ? new Date(selected) : new Date();
    next.setHours(h,m,0,0);
    onChange(serialize(next));
  };

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button id={id} type="button" variant="outline" className="date-time-trigger" aria-label={label}>
        <ClockIcon/><span>{display}</span><CalendarIcon/>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="kumo-date-time-panel" align="start" aria-label={`${label} picker`}>
      <DatePicker mode="single" selected={selected} defaultMonth={selected} fixedWeeks onChange={pickDay}/>
      <div className="kumo-time-fields">
        <Select label="Hour" size="sm" value={pad(hour)} onValueChange={v=>{if(v!==null)pickTime(Number(v),minute);}}
          items={Array.from({length:24},(_,h)=>({value:pad(h),label:pad(h)}))}/>
        <Select label="Minute" size="sm" value={pad(minute)} onValueChange={v=>{if(v!==null)pickTime(hour,Number(v));}}
          items={Array.from({length:60},(_,m)=>({value:pad(m),label:pad(m)}))}/>
      </div>
      <p className="kumo-timezone">24-hour time · Your browser’s local timezone</p>
      <div className="kumo-date-actions">
        <Button variant="ghost" size="sm" onClick={()=>onChange("")}>Clear</Button>
        <Button variant="secondary" size="sm" onClick={()=>pickDay(new Date())}>Today</Button>
        <Button size="sm" onClick={()=>setOpen(false)}>Done</Button>
      </div>
    </PopoverContent>
  </Popover>;
}
