"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  SearchIcon,
} from "@/components/ui/Icons";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  prefix?: string;
  badge?: string;
  iconUrl?: string | null;
  colorDot?: string | null;
};

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Choose an option…",
  title,
  searchable,
  size = "md",
  className = "",
  ariaLabel,
  disabled = false,
}: {
  options: SelectOption[];
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  title?: string;
  searchable?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUp: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const enableSearch = searchable ?? options.length >= 7;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q)),
    );
  }, [options, query]);

  const measurePosition = useCallback(() => {
    if (typeof window === "undefined") return;
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    if (mobile || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 14;
    const spaceAbove = rect.top - 14;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      180,
      Math.min(320, openUp ? spaceAbove - 8 : spaceBelow - 8),
    );
    const width = Math.max(rect.width, 220);
    const left = Math.max(
      10,
      Math.min(rect.left, window.innerWidth - width - 10),
    );
    const top = openUp ? rect.top - 6 : rect.bottom + 6;

    setCoords({ top, left, width, maxHeight, openUp });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measurePosition();
    const idx = filtered.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, measurePosition, filtered, value]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    if (enableSearch && !isMobile) {
      const t = window.setTimeout(() => searchRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open, enableSearch, isMobile]);

  // Lock background scroll when mobile sheet is open
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  // Close on outside click, Escape, resize/scroll (desktop)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          filtered.length ? (i + 1) % filtered.length : -1,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          filtered.length ? (i - 1 + filtered.length) % filtered.length : -1,
        );
      } else if (e.key === "Enter" && activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault();
        onChange(filtered[activeIndex].value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const onReposition = () => {
      if (window.innerWidth >= 640) {
        measurePosition();
      } else {
        setIsMobile(true);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, filtered, activeIndex, onChange, measurePosition]);

  const selectItem = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const renderOptionsList = (maxH?: number) => (
    <div
      role="listbox"
      aria-label={title || ariaLabel || placeholder}
      style={maxH ? { maxHeight: `${maxH}px` } : undefined}
      className={`overflow-y-auto overscroll-contain p-1.5 ${
        isMobile ? "max-h-[58vh] space-y-1 px-3 pb-3" : "space-y-0.5"
      }`}
    >
      {filtered.length === 0 ? (
        <div className="px-3 py-6 text-center font-mono text-[11px] text-zinc-500">
          No matching options
        </div>
      ) : (
        filtered.map((opt, idx) => {
          const isSelected = opt.value === value;
          const isHighlighted = idx === activeIndex;
          return (
            <button
              key={`${opt.value}-${idx}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => selectItem(opt.value)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl text-left transition-all duration-150 ${
                isMobile ? "min-h-[48px] px-3.5 py-2.5" : "min-h-[38px] px-3 py-2"
              } ${
                isSelected
                  ? "border border-brand-400/40 bg-brand-500/[0.16] text-white shadow-[inset_0_1px_0_rgba(165,243,252,0.12)]"
                  : isHighlighted
                    ? "border border-transparent bg-brand-300/[0.07] text-white"
                    : "border border-transparent text-zinc-200 hover:bg-brand-300/[0.06] hover:text-white"
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                {opt.iconUrl ? (
                  <Image
                    src={opt.iconUrl}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 shrink-0 rounded-lg object-cover ring-1 ring-white/15"
                  />
                ) : opt.colorDot ? (
                  <span
                    className="size-2.5 shrink-0 rounded-full ring-1 ring-white/25"
                    style={{ backgroundColor: opt.colorDot }}
                  />
                ) : opt.prefix ? (
                  <span className="shrink-0 font-mono text-[11.5px] text-brand-400">
                    {opt.prefix}
                  </span>
                ) : null}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-snug">
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="block truncate font-mono text-[10px] text-zinc-400">
                      {opt.description}
                    </span>
                  )}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2">
                {opt.badge && (
                  <span className="rounded-md border border-brand-400/30 bg-brand-950/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-brand-300">
                    {opt.badge}
                  </span>
                )}
                {isSelected && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand-500/25 text-brand-300">
                    <CheckIcon className="size-3" />
                  </span>
                )}
              </span>
            </button>
          );
        })
      )}
    </div>
  );

  const heightCls = size === "sm" ? "h-9 px-3 text-[12.5px]" : "h-10 px-3.5 text-[13px]";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || title || placeholder}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border bg-ink-950/90 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-50 ${heightCls} ${
          open
            ? "border-brand-400/65 shadow-[0_0_0_3px_rgb(var(--brand-500)/0.18)]"
            : "border-brand-200/[0.12] hover:border-brand-400/40 hover:bg-ink-900/90"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.iconUrl ? (
            <Image
              src={selected.iconUrl}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="size-5 shrink-0 rounded-md object-cover ring-1 ring-white/15"
            />
          ) : selected?.colorDot ? (
            <span
              className="size-2.5 shrink-0 rounded-full ring-1 ring-white/25"
              style={{ backgroundColor: selected.colorDot }}
            />
          ) : selected?.prefix ? (
            <span className="shrink-0 font-mono text-[11.5px] text-brand-400">
              {selected.prefix}
            </span>
          ) : null}

          <span
            className={`truncate font-medium ${
              selected && selected.value !== ""
                ? "text-zinc-100"
                : selected
                  ? "text-zinc-300"
                  : "text-zinc-500"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
        </span>

        <ChevronDownIcon
          className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-brand-300 ${
            open ? "rotate-180 text-brand-400" : ""
          }`}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          isMobile ? (
            /* Mobile In-Website Bottom Sheet */
            <div className="fixed inset-0 z-[130] flex flex-col justify-end">
              <div
                onClick={() => setOpen(false)}
                className="absolute inset-0 animate-fade-in bg-black/75 backdrop-blur-sm"
              />
              <div
                ref={panelRef}
                className="pb-safe relative z-10 w-full animate-sheet-up overflow-hidden rounded-t-3xl border-t border-brand-400/35 bg-ink-900/98 shadow-[0_-24px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
              >
                <div className="flex justify-center pt-3">
                  <span className="h-1 w-11 rounded-full bg-brand-200/20" />
                </div>
                <div className="flex items-center justify-between border-b border-brand-200/[0.08] px-4 pb-3 pt-2.5">
                  <p className="font-display text-[15px] font-semibold text-white">
                    {title || placeholder}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-brand-200/15 bg-ink-950/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 active:bg-brand-600/20"
                  >
                    Done
                  </button>
                </div>

                {enableSearch && (
                  <div className="border-b border-brand-200/[0.07] px-3.5 py-2.5">
                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-400/70" />
                      <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filter options…"
                        className="h-10 w-full rounded-xl border border-brand-200/12 bg-ink-950/90 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-500 focus:border-brand-400/60 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {renderOptionsList()}
              </div>
            </div>
          ) : (
            /* Desktop Floating Glass Popover */
            coords && (
              <div
                ref={panelRef}
                style={{
                  position: "fixed",
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  ...(coords.openUp
                    ? { bottom: `${window.innerHeight - coords.top}px` }
                    : { top: `${coords.top}px` }),
                }}
                className="z-[130] animate-pop-in overflow-hidden rounded-2xl border border-brand-500/30 bg-ink-900/98 shadow-[0_24px_65px_-12px_rgba(0,0,0,0.96),0_0_38px_-12px_rgb(var(--brand-500)/0.42)] backdrop-blur-2xl"
              >
                {enableSearch && (
                  <div className="border-b border-brand-200/[0.08] p-2">
                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-brand-400/75" />
                      <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search…"
                        className="h-8 w-full rounded-lg border border-brand-200/10 bg-ink-950/90 pl-8 pr-2.5 text-[12px] text-white placeholder:text-zinc-500 focus:border-brand-400/55 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {renderOptionsList(
                  enableSearch ? coords.maxHeight - 50 : coords.maxHeight,
                )}
              </div>
            )
          ),
          document.body,
        )}
    </div>
  );
}

const TIME_SLOTS: SelectOption[] = Array.from({ length: 48 }, (_, idx) => {
  const hours = Math.floor(idx / 2);
  const mins = idx % 2 === 0 ? "00" : "30";
  const value = `${String(hours).padStart(2, "0")}:${mins}`;
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return {
    value,
    label: `${value} (${h12}:${mins} ${period})`,
  };
});

export function TimeSelect({
  value,
  onChange,
  title = "Select Time",
}: {
  value: string;
  onChange: (next: string) => void;
  title?: string;
}) {
  const options = useMemo(() => {
    if (TIME_SLOTS.some((s) => s.value === value)) return TIME_SLOTS;
    return [{ value, label: value }, ...TIME_SLOTS];
  }, [value]);

  return (
    <div className="relative">
      <CustomSelect
        options={options.map((o) => ({ ...o, prefix: "◷" }))}
        value={value}
        onChange={onChange}
        title={title}
        searchable
      />
      <ClockIcon className="sr-only" />
    </div>
  );
}

const COLOR_SWATCHES = [
  { hex: "#ef4444", name: "LightCore Crimson" },
  { hex: "#dc2626", name: "Blood Scarlet" },
  { hex: "#f43f5e", name: "Neon Rose" },
  { hex: "#ec4899", name: "Sakura Pink" },
  { hex: "#f59e0b", name: "Cyber Gold" },
  { hex: "#10b981", name: "Emerald Matrix" },
  { hex: "#14b8a6", name: "Ocean Teal" },
  { hex: "#06b6d4", name: "Aqua Pulse" },
  { hex: "#38bdf8", name: "Arctic Sky" },
  { hex: "#6366f1", name: "Royal Indigo" },
  { hex: "#8b5cf6", name: "Royal Violet" },
  { hex: "#ffffff", name: "Pure White" },
] as const;

export function ColorSwatchSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeName =
    COLOR_SWATCHES.find((s) => s.hex.toLowerCase() === value.toLowerCase())
      ?.name || "Custom Hex";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-10 w-full items-center justify-between gap-2.5 rounded-xl border bg-ink-950/90 px-3.5 text-left transition-all ${
          open
            ? "border-brand-400/65 shadow-[0_0_0_3px_rgb(var(--brand-500)/0.18)]"
            : "border-brand-200/[0.12] hover:border-brand-400/40"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span
            className="size-5 rounded-md border border-white/25 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="text-[13px] font-medium text-white">
            {activeName}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">{value}</span>
        </span>
        <ChevronDownIcon
          className={`size-4 text-zinc-400 transition-transform ${
            open ? "rotate-180 text-brand-400" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 animate-pop-in rounded-2xl border border-brand-400/30 bg-ink-900/98 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-zinc-400">
            Embed Color Palette
          </p>
          <div className="mt-2.5 grid grid-cols-6 gap-2">
            {COLOR_SWATCHES.map((s) => {
              const selected = s.hex.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={s.hex}
                  type="button"
                  title={`${s.name} (${s.hex})`}
                  onClick={() => {
                    onChange(s.hex);
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-xl border transition-transform hover:scale-105 active:scale-95 ${
                    selected
                      ? "border-white ring-2 ring-brand-400"
                      : "border-white/15"
                  }`}
                  style={{ backgroundColor: s.hex }}
                >
                  {selected && (
                    <CheckIcon
                      className={`size-4 ${
                        s.hex === "#ffffff" ? "text-ink-950" : "text-white"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-brand-200/[0.08] pt-3">
            <span className="font-mono text-[10px] uppercase text-zinc-400">
              Hex
            </span>
            <input
              type="text"
              maxLength={7}
              value={value}
              onChange={(e) => {
                const v = e.target.value;
                onChange(v.startsWith("#") ? v : `#${v}`);
              }}
              placeholder="#ef4444"
              className="h-8 flex-1 rounded-lg border border-brand-200/12 bg-ink-950 px-2.5 font-mono text-[12px] text-white focus:border-brand-400/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 rounded-lg bg-brand-600 px-3 text-[11.5px] font-semibold text-white hover:bg-brand-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
