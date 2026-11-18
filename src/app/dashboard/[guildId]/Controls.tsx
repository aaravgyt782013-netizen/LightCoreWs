"use client";

import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";
import { CustomSelect } from "@/components/ui/CustomSelect";

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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        checked
          ? "border-brand-400/80 bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_0_18px_-2px_rgba(34,211,238,0.75)]"
          : "border-cyan-200/15 bg-ink-800"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform duration-200 ease-smooth ${
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
    <div className="panel panel-inner flex flex-col justify-between gap-4 rounded-2xl p-5 shadow-panel sm:flex-row sm:items-start sm:p-6">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-brand-400">
            {eyebrow}
          </span>
          {command && (
            <code className="rounded-md border border-brand-400/20 bg-ink-950/90 px-2 py-0.5 font-mono text-[10.5px] text-brand-200">
              {command}
            </code>
          )}
        </div>
        <h2 className="mt-2 font-display text-[21px] font-semibold tracking-tight text-white sm:text-[25px]">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>

      {typeof enabled === "boolean" && onToggle && (
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-cyan-200/10 bg-ink-950/75 px-3.5 py-2.5 sm:justify-start">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
              enabled ? "text-brand-300" : "text-zinc-500"
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
  const prefix = kind === "voice" ? "🔊" : kind === "category" ? "📁" : "#";

  return (
    <div className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      <div className="mt-1.5">
        {filtered.length > 0 ? (
          <CustomSelect
            title={label}
            placeholder="None selected"
            value={value}
            onChange={onChange}
            options={[
              { value: "", label: "None selected" },
              ...filtered.map((c) => ({
                value: c.id,
                label: c.name,
                prefix,
                description: `ID ${c.id}`,
              })),
            ]}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-aqua font-mono text-[12px]"
          />
        )}
      </div>
    </div>
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
    <div className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      <div className="mt-1.5">
        {roles.length > 0 ? (
          <CustomSelect
            title={label}
            placeholder="None selected"
            value={value}
            onChange={onChange}
            options={[
              { value: "", label: "None selected" },
              ...roles.map((r) => ({
                value: r.id,
                label: `@${r.name}`,
                colorDot: r.color || "#22d3ee",
                description: `ID ${r.id}`,
              })),
            ]}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-aqua font-mono text-[12px]"
          />
        )}
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-200/[0.08] bg-ink-950/50 px-4 py-3.5 transition-colors hover:border-brand-400/25">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13.5px] font-medium text-zinc-100">{title}</p>
          {badge && (
            <span className="rounded border border-brand-400/35 bg-brand-500/15 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-brand-200">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
