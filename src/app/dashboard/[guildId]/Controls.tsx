"use client";

import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        checked
          ? "border-brand-500/80 bg-brand-600 shadow-[0_0_16px_-2px_rgba(239,16,16,0.75)]"
          : "border-white/12 bg-ink-800"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function ModuleHeader({
  eyebrow,
  title,
  description,
  command,
  enabled,
  onToggle,
}: {
  eyebrow: string;
  title: string;
  description: string;
  command?: string;
  enabled?: boolean;
  onToggle?: (next: boolean) => void;
}) {
  return (
    <div className="panel panel-inner flex flex-wrap items-start justify-between gap-4 rounded-2xl p-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-brand-400">
            {eyebrow}
          </span>
          {command && (
            <code className="rounded-md border border-white/[0.08] bg-ink-950/80 px-2 py-0.5 font-mono text-[10.5px] text-zinc-300">
              {command}
            </code>
          )}
        </div>
        <h2 className="mt-2 font-display text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>

      {typeof enabled === "boolean" && onToggle && (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-ink-950/70 px-3.5 py-2.5">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
              enabled ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <Toggle
            checked={enabled}
            onChange={onToggle}
            label={`Toggle ${title}`}
          />
        </div>
      )}
    </div>
  );
}

export function ChannelField({
  label,
  value,
  onChange,
  channels,
  kind = "text",
  placeholder = "#channel-name or Channel ID",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  channels: DiscordChannelOption[];
  kind?: "text" | "voice" | "category";
  placeholder?: string;
}) {
  const filtered = channels.filter((c) => c.type === kind);
  const prefix = kind === "voice" ? "🔊 " : kind === "category" ? "📁 " : "# ";

  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      {filtered.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3 text-[13px] text-zinc-100 focus:border-brand-500/50 focus:outline-none"
        >
          <option value="">None selected</option>
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>
              {prefix}
              {c.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
        />
      )}
    </label>
  );
}

export function RoleField({
  label,
  value,
  onChange,
  roles,
  placeholder = "@role-name or Role ID",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  roles: DiscordRoleOption[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      {roles.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3 text-[13px] text-zinc-100 focus:border-brand-500/50 focus:outline-none"
        >
          <option value="">None selected</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              @ {r.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
        />
      )}
    </label>
  );
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  badge,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.018] px-4 py-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13.5px] font-medium text-zinc-100">{title}</p>
          {badge && (
            <span className="rounded border border-amber-400/35 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-amber-300">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
