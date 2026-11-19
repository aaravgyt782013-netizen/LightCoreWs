"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ANTINUKE_RULE_META,
  type AntiNukeRuleKey,
  type GuildConfig,
} from "@/lib/guild-config";
import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";
import { CrownIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { CustomSelect, TimeSelect } from "@/components/ui/CustomSelect";
import {
  ChannelField,
  ModuleHeader,
  RoleField,
  Toggle,
  ToggleRow,
} from "./Controls";

type UpdateConfig = (updater: (prev: GuildConfig) => GuildConfig) => void;

const WHITELIST_SCOPES = [
  "All",
  "Ban/Kick",
  "Channels",
  "Roles",
  "Webhooks",
  "Bots",
  "Everyone",
] as const;

const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export function AntiNukeModule({
  config,
  update,
  channels,
  premiumHref,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  premiumHref: string;
  prefix: string;
}) {
  const { antinuke } = config;
  const activeCount = ANTINUKE_RULE_META.filter(
    (r) => antinuke.rules[r.key].enabled,
  ).length;

  const setAllRules = (enabled: boolean) => {
    update((prev) => {
      const next = structuredClone(prev);
      for (const { key } of ANTINUKE_RULE_META) {
        next.antinuke.rules[key].enabled = enabled;
      }
      return next;
    });
  };

  const patchRule = (
    key: AntiNukeRuleKey,
    patch: Partial<{ enabled: boolean; limit: number; windowSec: number }>,
  ) => {
    update((prev) => ({
      ...prev,
      antinuke: {
        ...prev.antinuke,
        rules: {
          ...prev.antinuke.rules,
          [key]: { ...prev.antinuke.rules[key], ...patch },
        },
      },
    }));
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Security Setup · Anti-Nuke"
        title="Anti-Nuke Protection"
        description="Intercepts destructive actions in under 500ms. Configure punishment mode, automated state rollback, and per-action rate gates."
        command={`${prefix}antinuke enable`}
        enabled={antinuke.enabled}
        onToggle={(val) =>
          update((p) => ({ ...p, antinuke: { ...p.antinuke, enabled: val } }))
        }
      />

      {/* Global Anti-Nuke Policy */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
              Global Sanction &amp; Recovery
            </p>
            <p className="mt-1 text-[12.5px] text-zinc-500">
              Applied instantly when any non-whitelisted actor trips a guard.
            </p>
          </div>
          <Link
            href={premiumHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
          >
            <CrownIcon className="size-3.5" />
            Pro Guards
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Default Punishment
            </span>
            <div className="mt-1.5">
              <CustomSelect
                title="Default Anti-Nuke Punishment"
                value={antinuke.punishment}
                onChange={(val) =>
                  update((p) => ({
                    ...p,
                    antinuke: {
                      ...p.antinuke,
                      punishment: val as GuildConfig["antinuke"]["punishment"],
                    },
                  }))
                }
                options={[
                  {
                    value: "ban",
                    label: "Ban Offender",
                    badge: "Recommended",
                    description: "Instant permanent ban + rollback",
                  },
                  {
                    value: "kick",
                    label: "Kick Offender",
                    description: "Remove actor from server immediately",
                  },
                  {
                    value: "strip_roles",
                    label: "Strip Dangerous Roles",
                    description: "Remove all administrative & mod permissions",
                  },
                  {
                    value: "quarantine",
                    label: "Quarantine & Isolate",
                    description: "Lock actor into isolated quarantine role",
                  },
                ]}
              />
            </div>
          </div>

          <ChannelField
            label="Security Alert Channel"
            value={antinuke.logChannel}
            onChange={(val) =>
              update((p) => ({
                ...p,
                antinuke: { ...p.antinuke, logChannel: val },
              }))
            }
            channels={channels}
            placeholder="#antinuke-logs or Channel ID"
          />
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <ToggleRow
            title="Automatic Rollback"
            description="Restore deleted channels, roles & server metadata"
            checked={antinuke.autoRollback}
            onChange={(v) =>
              update((p) => ({
                ...p,
                antinuke: { ...p.antinuke, autoRollback: v },
              }))
            }
          />
          <ToggleRow
            title="Anti-Betray Mode"
            description="Monitor whitelisted admins for abnormal burst spikes"
            badge="Plus"
            checked={antinuke.antiBetray}
            onChange={(v) =>
              update((p) => ({
                ...p,
                antinuke: { ...p.antinuke, antiBetray: v },
              }))
            }
          />
          <ToggleRow
            title="Vanity URL Guard"
            description="Lock custom invite URL and revert unauthorized edits"
            badge="Pro"
            checked={antinuke.vanityGuard}
            onChange={(v) =>
              update((p) => ({
                ...p,
                antinuke: { ...p.antinuke, vanityGuard: v },
              }))
            }
          />
        </div>
      </div>

      {/* 14 Granular Guards */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
              Protection Modules · {activeCount}/{ANTINUKE_RULE_META.length}{" "}
              Armed
            </p>
            <p className="mt-1 text-[12.5px] text-zinc-500">
              Set the Limit System action threshold and rolling window for every
              event.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllRules(true)}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => setAllRules(false)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Disable All
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ANTINUKE_RULE_META.map(({ key, label, desc }) => {
            const rule = antinuke.rules[key];
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 transition-colors ${
                  rule.enabled
                    ? "border-brand-500/25 bg-brand-950/[0.14]"
                    : "border-white/[0.06] bg-white/[0.015] opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-white">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-500">
                      {desc}
                    </p>
                  </div>
                  <Toggle
                    checked={rule.enabled}
                    onChange={(enabled) => patchRule(key, { enabled })}
                    label={label}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-white/[0.06] pt-3">
                  <label className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-ink-950/70 px-2.5 py-1.5">
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                      Limit
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={rule.limit}
                      onChange={(e) =>
                        patchRule(key, {
                          limit: Math.max(
                            1,
                            Math.min(30, Number(e.target.value) || 1),
                          ),
                        })
                      }
                      className="w-14 bg-transparent text-right font-mono text-[12px] text-white focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-ink-950/70 px-2.5 py-1.5">
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                      Window (s)
                    </span>
                    <input
                      type="number"
                      min={10}
                      max={3600}
                      step={10}
                      value={rule.windowSec}
                      onChange={(e) =>
                        patchRule(key, {
                          windowSec: Math.max(
                            10,
                            Math.min(3600, Number(e.target.value) || 60),
                          ),
                        })
                      }
                      className="w-16 bg-transparent text-right font-mono text-[12px] text-white focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WhitelistModule({
  config,
  update,
  roles,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  roles: DiscordRoleOption[];
  prefix: string;
}) {
  const [wlId, setWlId] = useState("");
  const [wlTag, setWlTag] = useState("");
  const [wlScopes, setWlScopes] = useState<string[]>(["All"]);
  const [wlErr, setWlErr] = useState<string | null>(null);

  const [eoId, setEoId] = useState("");
  const [eoTag, setEoTag] = useState("");
  const [eoErr, setEoErr] = useState<string | null>(null);

  const [roleInput, setRoleInput] = useState("");

  const toggleScope = (scope: string) => {
    setWlScopes((prev) => {
      if (scope === "All") return ["All"];
      const withoutAll = prev.filter((s) => s !== "All");
      const next = withoutAll.includes(scope)
        ? withoutAll.filter((s) => s !== scope)
        : [...withoutAll, scope];
      return next.length === 0 ? ["All"] : next;
    });
  };

  const addWhitelistUser = () => {
    const cleanId = wlId.replace(/[^\d]/g, "");
    if (cleanId.length < 15 || cleanId.length > 22) {
      setWlErr("Enter a valid 17–20 digit Discord User ID.");
      return;
    }
    setWlErr(null);
    update((prev) => {
      const filtered = prev.whitelist.users.filter((u) => u.id !== cleanId);
      return {
        ...prev,
        whitelist: {
          ...prev.whitelist,
          users: [
            ...filtered,
            {
              id: cleanId,
              tag: wlTag.trim() || `User ${cleanId.slice(-4)}`,
              scopes: wlScopes,
            },
          ],
        },
      };
    });
    setWlId("");
    setWlTag("");
    setWlScopes(["All"]);
  };

  const addExtraOwner = () => {
    const cleanId = eoId.replace(/[^\d]/g, "");
    if (cleanId.length < 15 || cleanId.length > 22) {
      setEoErr("Enter a valid 17–20 digit Discord User ID.");
      return;
    }
    setEoErr(null);
    update((prev) => {
      const filtered = prev.whitelist.extraOwners.filter(
        (u) => u.id !== cleanId,
      );
      return {
        ...prev,
        whitelist: {
          ...prev.whitelist,
          extraOwners: [
            ...filtered,
            {
              id: cleanId,
              tag: eoTag.trim() || `Co-Owner ${cleanId.slice(-4)}`,
            },
          ],
        },
      };
    });
    setEoId("");
    setEoTag("");
  };

  const addBypassRole = () => {
    const val = roleInput.trim();
    if (!val) return;
    update((prev) => ({
      ...prev,
      whitelist: {
        ...prev.whitelist,
        bypassRoles: Array.from(new Set([...prev.whitelist.bypassRoles, val])),
      },
    }));
    setRoleInput("");
  };

  const resolveRoleName = (idOrName: string) => {
    const match = roles.find((r) => r.id === idOrName);
    return match ? `@${match.name}` : idOrName;
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Security Setup · Trust Hierarchy"
        title="Whitelist & Extra Owners"
        description="Explicitly authorize trusted co-owners, staff members, and bypass roles so Anti-Nuke never interrupts legitimate moderation."
        command={`${prefix}whitelist @user`}
      />

      {/* Whitelisted Users */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
          Whitelisted Users ({config.whitelist.users.length})
        </p>
        <p className="mt-1 text-[12.5px] text-zinc-500">
          Grant full or scoped Anti-Nuke exemptions by Discord User ID.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={wlId}
            onChange={(e) => setWlId(e.target.value)}
            placeholder="Discord User ID (e.g. 1538907226671022111)"
            className="h-10 rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
          />
          <input
            type="text"
            value={wlTag}
            onChange={(e) => setWlTag(e.target.value)}
            placeholder="Label / Username (optional)"
            className="h-10 rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={addWhitelistUser}
            className="btn-primary inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-[12.5px] font-semibold active:scale-[0.985]"
          >
            <PlusIcon className="size-3.5" />
            Add User
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
            Scopes:
          </span>
          {WHITELIST_SCOPES.map((s) => {
            const active = wlScopes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleScope(s)}
                className={`rounded-md border px-2.5 py-1 font-mono text-[10px] transition-colors ${
                  active
                    ? "border-brand-500/50 bg-brand-600/20 text-brand-200"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {wlErr && (
          <p className="mt-2 font-mono text-[11px] text-brand-300">{wlErr}</p>
        )}

        <div className="mt-4 space-y-2">
          {config.whitelist.users.length === 0 ? (
            <p className="rounded-xl border border-white/[0.05] bg-ink-950/50 px-4 py-5 text-center text-[12.5px] text-zinc-500">
              No whitelisted users yet. Only the server owner bypasses Anti-Nuke
              by default.
            </p>
          ) : (
            config.whitelist.users.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-ink-950/70 px-4 py-3"
              >
                <div>
                  <p className="text-[13px] font-medium text-white">
                    {u.tag}{" "}
                    <span className="font-mono text-[11px] text-zinc-500">
                      ({u.id})
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {u.scopes.map((sc) => (
                      <span
                        key={sc}
                        className="rounded border border-brand-500/25 bg-brand-950/40 px-1.5 py-0.5 font-mono text-[9px] text-brand-300"
                      >
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      whitelist: {
                        ...p.whitelist,
                        users: p.whitelist.users.filter((x) => x.id !== u.id),
                      },
                    }))
                  }
                  aria-label={`Remove ${u.tag}`}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-brand-500/40 hover:text-brand-300"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Extra Owners + Bypass Roles */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300">
              Extra Owners ({config.whitelist.extraOwners.length})
            </p>
            <code className="font-mono text-[10px] text-zinc-400">
              {prefix}extraowner set
            </code>
          </div>
          <p className="mt-1 text-[12px] text-zinc-500">
            Extra owners can edit Anti-Nuke &amp; Whitelist alongside the guild
            owner.
          </p>

          <div className="mt-4 space-y-2.5">
            <input
              type="text"
              value={eoId}
              onChange={(e) => setEoId(e.target.value)}
              placeholder="Trusted Co-Owner User ID"
              className="h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={eoTag}
                onChange={(e) => setEoTag(e.target.value)}
                placeholder="Note / tag (optional)"
                className="h-10 flex-1 rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[12.5px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={addExtraOwner}
                className="btn-primary inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[12.5px] font-semibold active:scale-[0.985]"
              >
                <PlusIcon className="size-3.5" />
                Add
              </button>
            </div>
            {eoErr && (
              <p className="font-mono text-[11px] text-brand-300">{eoErr}</p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {config.whitelist.extraOwners.length === 0 ? (
              <p className="rounded-xl border border-white/[0.05] bg-ink-950/50 px-3 py-4 text-center text-[12px] text-zinc-500">
                No extra owners assigned.
              </p>
            ) : (
              config.whitelist.extraOwners.map((eo) => (
                <div
                  key={eo.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.05] px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-amber-100">
                      {eo.tag}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      {eo.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        whitelist: {
                          ...p.whitelist,
                          extraOwners: p.whitelist.extraOwners.filter(
                            (x) => x.id !== eo.id,
                          ),
                        },
                      }))
                    }
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-brand-300"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-300">
              Trusted Bypass Roles ({config.whitelist.bypassRoles.length})
            </p>
            <code className="font-mono text-[10px] text-zinc-400">
              {prefix}mainrole
            </code>
          </div>
          <p className="mt-1 text-[12px] text-zinc-500">
            Members holding these roles bypass AutoMod and standard rate limits.
          </p>

          <div className="mt-4 flex gap-2">
            {roles.length > 0 ? (
              <CustomSelect
                className="flex-1"
                title="Select Trusted Bypass Role"
                placeholder="Select role…"
                value={roleInput}
                onChange={setRoleInput}
                options={roles.map((r) => ({
                  value: r.id,
                  label: `@${r.name}`,
                  colorDot: r.color || "#facc15",
                }))}
              />
            ) : (
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBypassRole();
                  }
                }}
                placeholder="@HeadMod or Role ID"
                className="h-10 flex-1 rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:outline-none"
              />
            )}
            <button
              type="button"
              onClick={addBypassRole}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[12.5px] font-semibold text-white hover:bg-white/[0.12]"
            >
              <PlusIcon className="size-3.5" />
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {config.whitelist.bypassRoles.length === 0 ? (
              <p className="w-full rounded-xl border border-white/[0.05] bg-ink-950/50 px-3 py-4 text-center text-[12px] text-zinc-500">
                No bypass roles added.
              </p>
            ) : (
              config.whitelist.bypassRoles.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/80 px-3 py-1.5 font-mono text-[11.5px] text-zinc-200"
                >
                  {resolveRoleName(r)}
                  <button
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        whitelist: {
                          ...p.whitelist,
                          bypassRoles: p.whitelist.bypassRoles.filter(
                            (x) => x !== r,
                          ),
                        },
                      }))
                    }
                    className="text-zinc-500 hover:text-brand-400"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AutoModModule({
  config,
  update,
  channels,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  prefix: string;
}) {
  const { automod } = config;
  const [domainInput, setDomainInput] = useState("");
  const [wordInput, setWordInput] = useState("");

  const addDomain = () => {
    const clean = domainInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!clean) return;
    update((p) => ({
      ...p,
      automod: {
        ...p.automod,
        antiLink: {
          ...p.automod.antiLink,
          allowedDomains: Array.from(
            new Set([...p.automod.antiLink.allowedDomains, clean]),
          ),
        },
      },
    }));
    setDomainInput("");
  };

  const addBadWord = () => {
    const clean = wordInput.trim().toLowerCase();
    if (!clean) return;
    update((p) => ({
      ...p,
      automod: {
        ...p.automod,
        antiBadWords: {
          ...p.automod.antiBadWords,
          words: Array.from(new Set([...p.automod.antiBadWords.words, clean])),
        },
      },
    }));
    setWordInput("");
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Security Setup · Content Firewall"
        title="AutoMod Engine"
        description="Real-time message & raid filtering across spam floods, phishing links, rogue invites, mass mentions, Zalgo text, and token raids."
        command={`${prefix}automod strict`}
        enabled={automod.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, automod: { ...p.automod, enabled } }))
        }
      />

      <div className="panel panel-inner grid gap-4 rounded-2xl p-5 sm:grid-cols-2 sm:p-6">
        <div className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Default Sanction
          </span>
          <div className="mt-1.5">
            <CustomSelect
              title="Default AutoMod Sanction"
              value={automod.punishment}
              onChange={(val) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    punishment: val as GuildConfig["automod"]["punishment"],
                  },
                }))
              }
              options={[
                {
                  value: "timeout_5m",
                  label: "Delete & Mute (5 minutes)",
                  badge: "Default",
                },
                { value: "timeout_1h", label: "Delete & Mute (1 hour)" },
                { value: "warn", label: "Delete & Warn" },
                { value: "kick", label: "Delete & Kick" },
                { value: "ban", label: "Delete & Ban" },
              ]}
            />
          </div>
        </div>

        <ChannelField
          label="AutoMod Log Channel"
          value={automod.logChannel}
          onChange={(logChannel) =>
            update((p) => ({ ...p, automod: { ...p.automod, logChannel } }))
          }
          channels={channels}
          placeholder="#automod-logs or Channel ID"
        />
      </div>

      {/* 8 Filter Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Anti Spam */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">Anti Spam</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Blocks rapid message bursts from single accounts
              </p>
            </div>
            <Toggle
              checked={automod.antiSpam.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiSpam: { ...p.automod.antiSpam, enabled },
                  },
                }))
              }
              label="Anti Spam"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9.5px] uppercase text-zinc-500">
                Max Messages
              </span>
              <input
                type="number"
                min={2}
                max={30}
                value={automod.antiSpam.maxMessages}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    automod: {
                      ...p.automod,
                      antiSpam: {
                        ...p.automod.antiSpam,
                        maxMessages: Number(e.target.value) || 5,
                      },
                    },
                  }))
                }
                className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-white focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9.5px] uppercase text-zinc-500">
                Per Seconds
              </span>
              <input
                type="number"
                min={3}
                max={60}
                value={automod.antiSpam.windowSec}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    automod: {
                      ...p.automod,
                      antiSpam: {
                        ...p.automod.antiSpam,
                        windowSec: Number(e.target.value) || 10,
                      },
                    },
                  }))
                }
                className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-white focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* Anti Token Spam */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white">
                  Anti Token Spam
                </p>
                <span className="rounded border border-amber-400/35 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-amber-300">
                  Plus
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Neutralizes coordinated botnet token joins &amp; synchronized
                spam
              </p>
            </div>
            <Toggle
              checked={automod.antiTokenSpam.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiTokenSpam: { ...p.automod.antiTokenSpam, enabled },
                  },
                }))
              }
              label="Anti Token Spam"
            />
          </div>
          <label className="mt-4 block">
            <span className="font-mono text-[9.5px] uppercase text-zinc-500">
              Max Joins / 10 Seconds
            </span>
            <input
              type="number"
              min={3}
              max={50}
              value={automod.antiTokenSpam.joinRateLimit}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiTokenSpam: {
                      ...p.automod.antiTokenSpam,
                      joinRateLimit: Number(e.target.value) || 10,
                    },
                  },
                }))
              }
              className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-white focus:outline-none"
            />
          </label>
        </div>

        {/* Anti Invite */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">
                Anti Discord Invite
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Deletes external discord.gg / discord.com/invite advertisements
              </p>
            </div>
            <Toggle
              checked={automod.antiInvite.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiInvite: { ...p.automod.antiInvite, enabled },
                  },
                }))
              }
              label="Anti Discord Invite"
            />
          </div>
          <label className="mt-4 flex items-center gap-2.5 text-[12.5px] text-zinc-300">
            <input
              type="checkbox"
              checked={automod.antiInvite.allowSupportServer}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiInvite: {
                      ...p.automod.antiInvite,
                      allowSupportServer: e.target.checked,
                    },
                  },
                }))
              }
              className="accent-brand-600"
            />
            Allow this server&apos;s own vanity &amp; partner invites
          </label>
        </div>

        {/* Anti Mass Mention */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">
                Anti Mass Mention
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Stops ghost-ping &amp; mass user/role mention spam
              </p>
            </div>
            <Toggle
              checked={automod.antiMassMention.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiMassMention: { ...p.automod.antiMassMention, enabled },
                  },
                }))
              }
              label="Anti Mass Mention"
            />
          </div>
          <label className="mt-4 block">
            <span className="font-mono text-[9.5px] uppercase text-zinc-500">
              Max Mentions Per Message
            </span>
            <input
              type="number"
              min={2}
              max={30}
              value={automod.antiMassMention.maxMentions}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiMassMention: {
                      ...p.automod.antiMassMention,
                      maxMentions: Number(e.target.value) || 5,
                    },
                  },
                }))
              }
              className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[12px] text-white focus:outline-none"
            />
          </label>
        </div>

        {/* Anti Caps */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">Anti Caps</p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Filters messages exceeding uppercase character threshold
              </p>
            </div>
            <Toggle
              checked={automod.antiCaps.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiCaps: { ...p.automod.antiCaps, enabled },
                  },
                }))
              }
              label="Anti Caps"
            />
          </div>
          <label className="mt-4 block">
            <span className="font-mono text-[9.5px] uppercase text-zinc-500">
              Uppercase Threshold ({automod.antiCaps.percent}%)
            </span>
            <input
              type="range"
              min={40}
              max={100}
              value={automod.antiCaps.percent}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiCaps: {
                      ...p.automod.antiCaps,
                      percent: Number(e.target.value),
                    },
                  },
                }))
              }
              className="mt-2 w-full accent-brand-600"
            />
          </label>
        </div>

        {/* Anti Zalgo */}
        <div className="panel panel-inner flex flex-col justify-between rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">
                Anti Zalgo &amp; Crash Text
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Strips corrupted combining Unicode, glitch fonts, and client-lag
                payloads automatically.
              </p>
            </div>
            <Toggle
              checked={automod.antiZalgo.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiZalgo: { enabled },
                  },
                }))
              }
              label="Anti Zalgo"
            />
          </div>
          <p className="mt-4 font-mono text-[10px] text-zinc-500">
            Command: <span className="text-zinc-300">{prefix}antizalgo on</span>
          </p>
        </div>

        {/* Anti Link + Allowed Domains */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">
                Anti Link &amp; Phishing
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Blocks external URLs except explicitly whitelisted domains
              </p>
            </div>
            <Toggle
              checked={automod.antiLink.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiLink: { ...p.automod.antiLink, enabled },
                  },
                }))
              }
              label="Anti Link"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDomain();
                }
              }}
              placeholder="Allow domain (e.g. tenor.com)"
              className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[11.5px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={addDomain}
              className="h-9 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[12px] font-medium text-white hover:bg-white/[0.12]"
            >
              Allow
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {automod.antiLink.allowedDomains.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950/80 px-2 py-0.5 font-mono text-[10.5px] text-zinc-300"
              >
                {d}
                <button
                  type="button"
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      automod: {
                        ...p.automod,
                        antiLink: {
                          ...p.automod.antiLink,
                          allowedDomains:
                            p.automod.antiLink.allowedDomains.filter(
                              (x) => x !== d,
                            ),
                        },
                      },
                    }))
                  }
                  className="text-zinc-500 hover:text-brand-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Anti Bad Words */}
        <div className="panel panel-inner rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-white">
                Anti Bad Words
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Custom blocked words, slurs, and scam keywords
              </p>
            </div>
            <Toggle
              checked={automod.antiBadWords.enabled}
              onChange={(enabled) =>
                update((p) => ({
                  ...p,
                  automod: {
                    ...p.automod,
                    antiBadWords: { ...p.automod.antiBadWords, enabled },
                  },
                }))
              }
              label="Anti Bad Words"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBadWord();
                }
              }}
              placeholder="Add blocked word or phrase…"
              className="h-9 flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 font-mono text-[11.5px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={addBadWord}
              className="h-9 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[12px] font-medium text-white hover:bg-white/[0.12]"
            >
              Block
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {automod.antiBadWords.words.length === 0 ? (
              <span className="font-mono text-[10.5px] text-zinc-600">
                Built-in phishing &amp; slur list active. Add custom words
                above.
              </span>
            ) : (
              automod.antiBadWords.words.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand-500/25 bg-brand-950/40 px-2 py-0.5 font-mono text-[10.5px] text-brand-200"
                >
                  {w}
                  <button
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        automod: {
                          ...p.automod,
                          antiBadWords: {
                            ...p.automod.antiBadWords,
                            words: p.automod.antiBadWords.words.filter(
                              (x) => x !== w,
                            ),
                          },
                        },
                      }))
                    }
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NightModeModule({
  config,
  update,
  roles,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  roles: DiscordRoleOption[];
  prefix: string;
}) {
  const { nightmode } = config;

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Security Setup · Overnight Shield"
        title="Night Mode & Lockdown"
        description="Automatically strip dangerous staff permissions and lock public channels while your team sleeps, then restore the exact state at morning."
        command={`${prefix}nightmode ${nightmode.startTime} ${nightmode.endTime}`}
        enabled={nightmode.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, nightmode: { ...p.nightmode, enabled } }))
        }
      />

      {/* Instant Emergency Lockdown Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 transition-colors ${
          nightmode.lockdownActive
            ? "border-brand-400/60 bg-brand-950/60 shadow-[0_0_42px_-12px_rgb(var(--brand-500)/0.65)]"
            : "border-brand-200/10 bg-ink-900/55"
        }`}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            Live Override · Emergency Lockdown
          </p>
          <p className="mt-1 font-display text-[17px] font-semibold text-white">
            {nightmode.lockdownActive
              ? "Server Lockdown is ARMED"
              : "Trigger Instant Lockdown"}
          </p>
          <p className="mt-0.5 text-[12.5px] text-zinc-400">
            Immediately freeze public channels and pause destructive role
            permissions regardless of schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            update((p) => ({
              ...p,
              nightmode: {
                ...p.nightmode,
                lockdownActive: !p.nightmode.lockdownActive,
              },
            }))
          }
          className={`h-11 rounded-xl px-5 text-[13px] font-semibold transition-colors ${
            nightmode.lockdownActive
              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
              : "btn-primary"
          }`}
        >
          {nightmode.lockdownActive ? "Lift Lockdown" : "Engage Lockdown Now"}
        </button>
      </div>

      {/* Schedule + Role */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
          Lockdown Window
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Start Time
            </span>
            <div className="mt-1.5">
              <TimeSelect
                title="Night Mode Start Time"
                value={nightmode.startTime}
                onChange={(startTime) =>
                  update((p) => ({
                    ...p,
                    nightmode: { ...p.nightmode, startTime },
                  }))
                }
              />
            </div>
          </div>
          <div className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Morning Restore
            </span>
            <div className="mt-1.5">
              <TimeSelect
                title="Morning Restore Time"
                value={nightmode.endTime}
                onChange={(endTime) =>
                  update((p) => ({
                    ...p,
                    nightmode: { ...p.nightmode, endTime },
                  }))
                }
              />
            </div>
          </div>
          <div className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Timezone
            </span>
            <div className="mt-1.5">
              <CustomSelect
                title="Night Mode Timezone"
                searchable
                value={nightmode.timezone}
                onChange={(timezone) =>
                  update((p) => ({
                    ...p,
                    nightmode: { ...p.nightmode, timezone },
                  }))
                }
                options={TIMEZONES.map((tz) => ({
                  value: tz,
                  label: tz.replace("_", " "),
                  prefix: "🌐",
                }))}
              />
            </div>
          </div>
          <RoleField
            label="Night Bypass Role"
            value={nightmode.bypassRole}
            onChange={(bypassRole) =>
              update((p) => ({
                ...p,
                nightmode: { ...p.nightmode, bypassRole },
              }))
            }
            roles={roles}
            placeholder="@NightStaff or Role ID"
          />
        </div>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <ToggleRow
            title="Strip Dangerous Permissions"
            description="Temporarily snapshot & remove Admin, Ban, Kick, and Manage Channels from roles"
            checked={nightmode.stripDangerousPerms}
            onChange={(stripDangerousPerms) =>
              update((p) => ({
                ...p,
                nightmode: { ...p.nightmode, stripDangerousPerms },
              }))
            }
          />
          <ToggleRow
            title="Freeze Public Channels"
            description="Lock @everyone Send Messages in unmonitored text channels"
            checked={nightmode.lockChannels}
            onChange={(lockChannels) =>
              update((p) => ({
                ...p,
                nightmode: { ...p.nightmode, lockChannels },
              }))
            }
          />
          <ToggleRow
            title="Auto Emergency on Raid Spike"
            description="Trigger Night Mode automatically if join velocity surges"
            badge="Ultra"
            checked={nightmode.autoOnRaid}
            onChange={(autoOnRaid) =>
              update((p) => ({
                ...p,
                nightmode: { ...p.nightmode, autoOnRaid },
              }))
            }
          />
          <ToggleRow
            title="Automatic Morning Restore"
            description="Re-apply every snapshotted role & channel permission at end time"
            checked={nightmode.autoRestoreMorning}
            onChange={(autoRestoreMorning) =>
              update((p) => ({
                ...p,
                nightmode: { ...p.nightmode, autoRestoreMorning },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export function VerificationModule({
  config,
  update,
  channels,
  roles,
  guildName,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  roles: DiscordRoleOption[];
  guildName: string;
  prefix: string;
}) {
  const { verification } = config;
  const [tested, setTested] = useState(false);

  const previewDesc = verification.panelDescription
    .replaceAll("{server}", guildName)
    .replaceAll("**", "");

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Security Setup · Member Gate"
        title="Verification & Alt Firewall"
        description="Gate newly joined accounts behind a one-click button, visual captcha, or ephemeral passcode challenge while blocking fresh burner accounts."
        command={`${prefix}verify setup`}
        enabled={verification.enabled}
        onToggle={(enabled) =>
          update((p) => ({
            ...p,
            verification: { ...p.verification, enabled },
          }))
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Challenge Mode
              </span>
              <div className="mt-1.5">
                <CustomSelect
                  title="Verification Challenge Mode"
                  value={verification.mode}
                  onChange={(val) =>
                    update((p) => ({
                      ...p,
                      verification: {
                        ...p.verification,
                        mode: val as GuildConfig["verification"]["mode"],
                      },
                    }))
                  }
                  options={[
                    {
                      value: "button",
                      label: "One-Click Button",
                      badge: "Fastest",
                      description: "Instant interaction verification + age check",
                    },
                    {
                      value: "captcha",
                      label: "Visual Image Captcha",
                      badge: "Anti-Bot",
                      description: "Distorted ephemeral captcha blocks automated raids",
                    },
                    {
                      value: "code",
                      label: "Ephemeral 6-Digit Code",
                      description: "Modal code challenge with 3-attempt lock",
                    },
                  ]}
                />
              </div>
            </div>

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Min Account Age ({verification.minAccountAgeDays} days)
              </span>
              <input
                type="range"
                min={0}
                max={90}
                value={verification.minAccountAgeDays}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    verification: {
                      ...p.verification,
                      minAccountAgeDays: Number(e.target.value),
                    },
                  }))
                }
                className="mt-3.5 w-full accent-brand-600"
              />
              <p className="mt-1 font-mono text-[10px] text-zinc-500">
                {verification.minAccountAgeDays === 0
                  ? "Account age filter disabled"
                  : `Quarantines accounts younger than ${verification.minAccountAgeDays} day(s)`}
              </p>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChannelField
              label="Verification Gate Channel"
              value={verification.channel}
              onChange={(channel) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, channel },
                }))
              }
              channels={channels}
              placeholder="#verify"
            />
            <ChannelField
              label="Verification Log Channel"
              value={verification.logChannel}
              onChange={(logChannel) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, logChannel },
                }))
              }
              channels={channels}
              placeholder="#verify-logs"
            />
            <RoleField
              label="Verified Member Role"
              value={verification.verifiedRole}
              onChange={(verifiedRole) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, verifiedRole },
                }))
              }
              roles={roles}
              placeholder="@Verified"
            />
            <RoleField
              label="Unverified Hold Role (Optional)"
              value={verification.unverifiedRole}
              onChange={(unverifiedRole) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, unverifiedRole },
                }))
              }
              roles={roles}
              placeholder="@Unverified"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Panel Embed Title
              </span>
              <input
                type="text"
                maxLength={100}
                value={verification.panelTitle}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    verification: {
                      ...p.verification,
                      panelTitle: e.target.value,
                    },
                  }))
                }
                className="input-aqua mt-1.5"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Button Label
              </span>
              <input
                type="text"
                maxLength={40}
                value={verification.buttonLabel}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    verification: {
                      ...p.verification,
                      buttonLabel: e.target.value,
                    },
                  }))
                }
                className="input-aqua mt-1.5"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Panel Description (supports {"{server}"})
            </span>
            <textarea
              rows={2}
              value={verification.panelDescription}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  verification: {
                    ...p.verification,
                    panelDescription: e.target.value,
                  },
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-950/90 p-3 text-[13px] text-zinc-100 focus:border-brand-500/50 focus:outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              title="Auto-Pause Verification on Raid"
              description="Temporarily hold new grants if join velocity exceeds Anti-Raid gate"
              checked={verification.autoRaidPause}
              onChange={(autoRaidPause) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, autoRaidPause },
                }))
              }
            />
            <ToggleRow
              title="Send Confirmation DM"
              description="Message members a brief welcome confirmation after passing"
              checked={verification.dmOnVerify}
              onChange={(dmOnVerify) =>
                update((p) => ({
                  ...p,
                  verification: { ...p.verification, dmOnVerify },
                }))
              }
            />
          </div>
        </div>

        {/* Live Interactive Discord Gate Preview */}
        <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            Live Discord Gate Preview
          </p>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#1e1f22] p-4">
            <div
              className="rounded-md bg-[#2b2d31] p-4"
              style={{ borderLeft: `4px solid ${config.general.embedColor}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-white">
                  {verification.panelTitle || "Verify to Unlock Server"}
                </p>
                <span className="rounded bg-black/35 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-400">
                  {verification.mode}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-300">
                {previewDesc}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-zinc-400">
                <span className="rounded bg-[#1e1f22] px-2 py-0.5">
                  Min age: {verification.minAccountAgeDays}d
                </span>
                {verification.autoRaidPause && (
                  <span className="rounded bg-[#1e1f22] px-2 py-0.5 text-emerald-300">
                    Raid shield linked
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTested(true);
                  window.setTimeout(() => setTested(false), 2400);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#248046] px-3.5 text-[12.5px] font-medium text-white transition hover:bg-[#1a6334]"
              >
                <span>✓</span>
                <span>{verification.buttonLabel || "Verify Account"}</span>
              </button>
              <span className="font-mono text-[10px] text-zinc-500">
                Click to test flow
              </span>
            </div>

            {tested && (
              <div className="mt-3 rounded-md border border-emerald-500/25 bg-[#2b2d31] px-3 py-2 text-[11.5px] text-emerald-300">
                <span className="font-mono text-[9.5px] uppercase text-zinc-400">
                  Only you can see this ·{" "}
                </span>
                {verification.mode === "captcha"
                  ? "Captcha challenge spawned (X7K9M) → grants Verified role on match."
                  : verification.mode === "code"
                    ? "6-digit passcode modal opened → grants Verified role on submit."
                    : `Verified! Access to ${guildName} unlocked.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
