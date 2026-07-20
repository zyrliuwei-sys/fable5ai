import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, ImagePlus, Command, ChevronDown, Check } from "lucide-react";
import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CAPABILITIES, getCapability, type CapabilityId } from "./capabilities";

export type Autonomy = "auto" | "ask";

/**
 * Agent composer — cloned from chatlyai.app/agent.
 * Rounded-24 white box: auto-growing input + a button row.
 *   left:  [capability ▾] [attach] [image]
 *   right: [Auto ▾ autonomy] [⌘ commands] [Think ▾] [send ↑]
 * Enter sends, Shift+Enter inserts a newline.
 */
export function AgentComposer({
  value,
  onChange,
  onSend,
  mode,
  onSelectMode,
  autonomy,
  onSelectAutonomy,
  think,
  onToggleThink,
  sending,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  mode: CapabilityId;
  onSelectMode: (id: CapabilityId) => void;
  autonomy: Autonomy;
  onSelectAutonomy: (a: Autonomy) => void;
  think: boolean;
  onToggleThink: (v: boolean) => void;
  sending: boolean;
  disabled?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [phIndex, setPhIndex] = useState(0);

  // Cycle placeholder examples while the input is empty (chatlyai behavior).
  useEffect(() => {
    if (value.trim()) return;
    const t = setInterval(() => setPhIndex((i) => (i + 1) % CAPABILITIES.length), 3500);
    return () => clearInterval(t);
  }, [value]);

  // Auto-grow the textarea up to ~200px.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const cap = getCapability(mode);
  const CapIcon = cap.icon;
  const placeholder = tDynamic(CAPABILITIES[phIndex].placeholderKey);
  const canSend = value.trim().length > 0 && !sending && !disabled;

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  // Tool buttons focus the input (file upload is out of scope).
  const focusInput = () => taRef.current?.focus();

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-3 shadow-sm transition-shadow focus-within:border-[#d4d4d4] focus-within:shadow-md">
      {/* Input */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder={placeholder}
        className="block max-h-[200px] w-full resize-none bg-transparent px-1.5 py-1.5 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
      />

      {/* Button row */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {/* Left: capability + tools */}
        <div className="flex items-center gap-1.5">
          {/* Capability selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 items-center justify-center rounded-full bg-accent text-foreground transition-colors hover:bg-accent/80"
              aria-label={tDynamic(cap.labelKey)}
            >
              <CapIcon className="size-[18px]" strokeWidth={1.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="max-h-[320px] w-[220px] overflow-y-auto"
            >
              {CAPABILITIES.map((c) => {
                const Icon = c.icon;
                const active = c.id === mode;
                return (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => onSelectMode(c.id)}
                    className="gap-2"
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    <span className="flex-1">{tDynamic(c.labelKey)}</span>
                    {active && <Check className="size-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={focusInput}
            aria-label="Attach"
            className="flex size-8 items-center justify-center rounded-full border border-[#e0e0e0] text-foreground transition-colors hover:bg-accent"
          >
            <Paperclip className="size-[18px]" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={focusInput}
            aria-label="Add image"
            className="flex size-8 items-center justify-center rounded-full border border-[#e0e0e0] text-foreground transition-colors hover:bg-accent"
          >
            <ImagePlus className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Right: autonomy + commands + think + send */}
        <div className="flex items-center gap-1.5">
          {/* Autonomy */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1 rounded-full border border-[#e0e0e0] px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              {tDynamic(`agent.autonomy.${autonomy}.label`)}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-[280px]">
              {(["auto", "ask"] as const).map((a) => (
                <DropdownMenuItem
                  key={a}
                  onClick={() => onSelectAutonomy(a)}
                  className="flex-col items-start gap-0.5 py-2"
                >
                  <span className="flex w-full items-center justify-between text-sm font-medium">
                    {tDynamic(`agent.autonomy.${a}.label`)}
                    {autonomy === a && <Check className="size-4" />}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tDynamic(`agent.autonomy.${a}.desc`)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={focusInput}
            aria-label={m["agent.open_commands"]()}
            className="flex size-8 items-center justify-center rounded-full border border-[#e0e0e0] text-foreground transition-colors hover:bg-accent"
          >
            <Command className="size-[18px]" strokeWidth={1.75} />
          </button>

          {/* Think toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              {think ? m["agent.think.on"]() : m["agent.think.off"]()}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-[180px]">
              <DropdownMenuItem onClick={() => onToggleThink(true)} className="gap-2">
                <span className="flex-1">{m["agent.think.on"]()}</span>
                {think && <Check className="size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleThink(false)} className="gap-2">
                <span className="flex-1">{m["agent.think.off"]()}</span>
                {!think && <Check className="size-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Send */}
          <button
            type="button"
            onClick={() => canSend && onSend()}
            disabled={!canSend}
            aria-label={m["settings.agent.send"]()}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              canSend
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-accent text-muted-foreground"
            )}
          >
            {sending ? (
              <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            ) : (
              <ArrowUp className="size-[18px]" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
