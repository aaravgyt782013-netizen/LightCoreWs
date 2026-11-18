"use client";

import Image from "next/image";
import { useState } from "react";
import { site, type LogEntry } from "@/lib/site";
import type { GuildConfig } from "@/lib/guild-config";
import type {
  DiscordChannelOption,
  DiscordRoleOption,
} from "@/lib/discord-guilds";
import { PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  ChannelField,
  ModuleHeader,
  RoleField,
  Toggle,
  ToggleRow,
} from "./Controls";

type UpdateConfig = (updater: (prev: GuildConfig) => GuildConfig) => void;

export function ModerationModule({
  config,
  update,
  channels,
  roles,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  roles: DiscordRoleOption[];
  prefix: string;
}) {
  const { moderation } = config;
  const modCommands = [
    [`${prefix}ban @user [reason]`, "Permanently ban member & log case"],
    [`${prefix}kick @user [reason]`, "Remove member with DM notice"],
    [`${prefix}mute @user 10m`, "Timeout or apply mute role"],
    [`${prefix}warn @user [reason]`, "Issue warning with auto-escalation"],
    [`${prefix}purge 50`, "Bulk delete up to 1,000 messages"],
    [`${prefix}lock / ${prefix}unlock`, "Freeze or reopen current channel"],
    [`${prefix}hide / ${prefix}unhide`, "Toggle channel visibility"],
    [`${prefix}autorole humans @role`, "Auto-assign role to new members"],
  ] as const;

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Staff & Roles"
        title="Moderation & AutoRole"
        description="Configure warning escalation ladders, staff audit routing, mute role behavior, and instant join roles for humans and bots."
        command={`${prefix}autorole`}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            Moderation &amp; Escalation
          </p>
          <RoleField
            label="Muted / Quarantine Role"
            value={moderation.muteRole}
            onChange={(muteRole) =>
              update((p) => ({
                ...p,
                moderation: { ...p.moderation, muteRole },
              }))
            }
            roles={roles}
            placeholder="@Muted or Role ID"
          />
          <ChannelField
            label="Moderation Case Log Channel"
            value={moderation.modLogChannel}
            onChange={(modLogChannel) =>
              update((p) => ({
                ...p,
                moderation: { ...p.moderation, modLogChannel },
              }))
            }
            channels={channels}
            placeholder="#mod-logs or Channel ID"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                Warns → Auto Mute
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={moderation.warnMuteThreshold}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    moderation: {
                      ...p.moderation,
                      warnMuteThreshold: Number(e.target.value) || 3,
                    },
                  }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[13px] text-white focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                Warns → Auto Ban
              </span>
              <input
                type="number"
                min={2}
                max={30}
                value={moderation.warnBanThreshold}
                onChange={(e) =>
                  update((p) => ({
                    ...p,
                    moderation: {
                      ...p.moderation,
                      warnBanThreshold: Number(e.target.value) || 5,
                    },
                  }))
                }
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[13px] text-white focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            AutoRole on Member Join
          </p>
          <RoleField
            label="Human AutoRole"
            value={moderation.humanAutoRole}
            onChange={(humanAutoRole) =>
              update((p) => ({
                ...p,
                moderation: { ...p.moderation, humanAutoRole },
              }))
            }
            roles={roles}
            placeholder="@Member or Role ID"
          />
          <RoleField
            label="Bot AutoRole"
            value={moderation.botAutoRole}
            onChange={(botAutoRole) =>
              update((p) => ({
                ...p,
                moderation: { ...p.moderation, botAutoRole },
              }))
            }
            roles={roles}
            placeholder="@Bots or Role ID"
          />
          <ToggleRow
            title="Sticky Nicknames"
            description="Restore a member's previous server nickname if they leave and rejoin"
            checked={moderation.stickyNicknames}
            onChange={(stickyNicknames) =>
              update((p) => ({
                ...p,
                moderation: { ...p.moderation, stickyNicknames },
              }))
            }
          />
        </div>
      </div>

      {/* Quick command cheat sheet */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
          Active Moderation Commands ({prefix})
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {modCommands.map(([cmd, desc]) => (
            <div
              key={cmd}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-ink-950/60 px-3.5 py-2.5"
            >
              <code className="font-mono text-[11.5px] text-brand-300">
                {cmd}
              </code>
              <span className="text-right text-[11.5px] text-zinc-500">
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WelcomerModule({
  config,
  update,
  channels,
  guildName,
  memberCount,
  username,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  guildName: string;
  memberCount: number | null;
  username: string;
  prefix: string;
}) {
  const { welcomer } = config;
  const vars = ["{user}", "{username}", "{server}", "{membercount}"] as const;

  const renderTemplate = (tpl: string) =>
    tpl
      .replaceAll("{user}", `@${username}`)
      .replaceAll("{username}", username)
      .replaceAll("{server}", guildName)
      .replaceAll("{membercount}", String(memberCount ?? 1248))
      .replaceAll("**", "");

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Greetings"
        title="Welcomer & Leave System"
        description="Greet new members with customizable embeds, banners, DMs, and dynamic server variables."
        command={`${prefix}greet setup`}
        enabled={welcomer.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, welcomer: { ...p.welcomer, enabled } }))
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
          <ChannelField
            label="Welcome Channel"
            value={welcomer.channel}
            onChange={(channel) =>
              update((p) => ({ ...p, welcomer: { ...p.welcomer, channel } }))
            }
            channels={channels}
            placeholder="#welcome or Channel ID"
          />

          <label className="block">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Welcome Message
              </span>
              <div className="flex flex-wrap gap-1">
                {vars.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      update((p) => ({
                        ...p,
                        welcomer: {
                          ...p.welcomer,
                          message: `${p.welcomer.message} ${v}`.trim(),
                        },
                      }))
                    }
                    className="rounded border border-white/10 bg-ink-950 px-1.5 py-0.5 font-mono text-[9.5px] text-brand-300 hover:border-brand-500/40"
                  >
                    +{v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={welcomer.message}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  welcomer: { ...p.welcomer, message: e.target.value },
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-950/90 p-3 text-[13px] text-zinc-100 focus:border-brand-500/50 focus:outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              title="Send as Rich Embed"
              description="Wrap greeting in a styled embed card"
              checked={welcomer.useEmbed}
              onChange={(useEmbed) =>
                update((p) => ({ ...p, welcomer: { ...p.welcomer, useEmbed } }))
              }
            />
            <ToggleRow
              title="Direct Message Greeting"
              description="Also DM the welcome card to joining users"
              checked={welcomer.dmWelcome}
              onChange={(dmWelcome) =>
                update((p) => ({
                  ...p,
                  welcomer: { ...p.welcomer, dmWelcome },
                }))
              }
            />
          </div>

          {welcomer.useEmbed && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Embed Title
                </span>
                <input
                  type="text"
                  value={welcomer.embedTitle}
                  onChange={(e) =>
                    update((p) => ({
                      ...p,
                      welcomer: { ...p.welcomer, embedTitle: e.target.value },
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3 text-[13px] text-zinc-100 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Banner Image URL (Optional)
                </span>
                <input
                  type="url"
                  value={welcomer.bannerUrl}
                  onChange={(e) =>
                    update((p) => ({
                      ...p,
                      welcomer: { ...p.welcomer, bannerUrl: e.target.value },
                    }))
                  }
                  placeholder="https://…/banner.gif"
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3 font-mono text-[11.5px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
              </label>
            </div>
          )}
        </div>

        {/* Live Discord Preview */}
        <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            Live Discord Preview
          </p>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#1e1f22] p-4">
            <div className="flex items-start gap-3">
              <Image
                src={site.logo}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-white">
                    {site.name}
                  </span>
                  <span className="rounded bg-[#5865F2] px-1 py-px text-[9px] font-bold uppercase text-white">
                    APP
                  </span>
                  <span className="text-[10.5px] text-zinc-500">
                    Today at 12:00
                  </span>
                </div>

                {welcomer.useEmbed ? (
                  <div
                    className="mt-2 rounded-md bg-[#2b2d31] p-3.5"
                    style={{
                      borderLeft: `4px solid ${config.general.embedColor}`,
                    }}
                  >
                    {welcomer.embedTitle && (
                      <p className="text-[13.5px] font-semibold text-white">
                        {renderTemplate(welcomer.embedTitle)}
                      </p>
                    )}
                    <p className="mt-1.5 break-words text-[12.5px] leading-relaxed text-zinc-300">
                      {renderTemplate(welcomer.message)}
                    </p>
                    {welcomer.bannerUrl && (
                      <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2 font-mono text-[10px] text-zinc-400">
                        Banner attached: {welcomer.bannerUrl.slice(0, 38)}…
                      </div>
                    )}
                    <p className="mt-2.5 text-[10px] text-zinc-500">
                      {site.name} · {guildName}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 break-words text-[13px] text-zinc-200">
                    {renderTemplate(welcomer.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Messages */}
      <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-white">
              Leave / Farewell Messages
            </p>
            <p className="text-[12px] text-zinc-500">
              Announce when members leave or are removed from the server.
            </p>
          </div>
          <Toggle
            checked={welcomer.leaveEnabled}
            onChange={(leaveEnabled) =>
              update((p) => ({ ...p, welcomer: { ...p.welcomer, leaveEnabled } }))
            }
            label="Leave messages"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChannelField
            label="Leave Channel"
            value={welcomer.leaveChannel}
            onChange={(leaveChannel) =>
              update((p) => ({
                ...p,
                welcomer: { ...p.welcomer, leaveChannel },
              }))
            }
            channels={channels}
            placeholder="#leaves or Channel ID"
          />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Leave Message
            </span>
            <input
              type="text"
              value={welcomer.leaveMessage}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  welcomer: { ...p.welcomer, leaveMessage: e.target.value },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[13px] text-zinc-100 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export function VoiceMasterModule({
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
  const { voicemaster } = config;

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Temp Voice"
        title="VoiceMaster (Join-to-Create)"
        description="Members join a hub channel to spawn their own temporary voice room with instant lock, hide, rename, limit, and claim buttons."
        command={`${prefix}voicemaster setup`}
        enabled={voicemaster.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, voicemaster: { ...p.voicemaster, enabled } }))
        }
      />

      <div className="panel panel-inner space-y-5 rounded-2xl p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <ChannelField
            label="VoiceMaster Category"
            kind="category"
            value={voicemaster.category}
            onChange={(category) =>
              update((p) => ({
                ...p,
                voicemaster: { ...p.voicemaster, category },
              }))
            }
            channels={channels}
            placeholder="Category name or ID"
          />
          <ChannelField
            label="Join-to-Create Hub"
            kind="voice"
            value={voicemaster.joinChannel}
            onChange={(joinChannel) =>
              update((p) => ({
                ...p,
                voicemaster: { ...p.voicemaster, joinChannel },
              }))
            }
            channels={channels}
            placeholder="➕ Join to Create or ID"
          />
          <ChannelField
            label="Control Interface Channel"
            kind="text"
            value={voicemaster.controlChannel}
            onChange={(controlChannel) =>
              update((p) => ({
                ...p,
                voicemaster: { ...p.voicemaster, controlChannel },
              }))
            }
            channels={channels}
            placeholder="#vc-interface or ID"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Channel Name Template
            </span>
            <input
              type="text"
              value={voicemaster.nameTemplate}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  voicemaster: {
                    ...p.voicemaster,
                    nameTemplate: e.target.value,
                  },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[13px] text-white focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Default User Limit (0 = Unlimited)
            </span>
            <input
              type="number"
              min={0}
              max={99}
              value={voicemaster.defaultLimit}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  voicemaster: {
                    ...p.voicemaster,
                    defaultLimit: Math.max(
                      0,
                      Math.min(99, Number(e.target.value) || 0),
                    ),
                  },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[13px] text-white focus:outline-none"
            />
          </label>
          <div className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Default Bitrate
            </span>
            <div className="mt-1.5">
              <CustomSelect
                title="VoiceMaster Audio Bitrate"
                value={String(voicemaster.bitrateKbps)}
                onChange={(val) =>
                  update((p) => ({
                    ...p,
                    voicemaster: {
                      ...p.voicemaster,
                      bitrateKbps: Number(val),
                    },
                  }))
                }
                options={[
                  { value: "64", label: "64 kbps", description: "Standard voice quality" },
                  { value: "96", label: "96 kbps", badge: "Default", description: "Crisp stereo voice" },
                  { value: "128", label: "128 kbps", description: "Boost Tier 1 quality" },
                  { value: "256", label: "256 kbps", description: "Boost Tier 2 studio" },
                  { value: "384", label: "384 kbps", description: "Boost Tier 3 lossless" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleRow
            title="Interactive Button Interface"
            description="Post Lock, Unlock, Hide, Claim, Rename, Permit & Kick controls in room chat"
            checked={voicemaster.sendInterface}
            onChange={(sendInterface) =>
              update((p) => ({
                ...p,
                voicemaster: { ...p.voicemaster, sendInterface },
              }))
            }
          />
          <ToggleRow
            title="Auto-Delete Empty Rooms"
            description="Instantly clean up temporary voice rooms when the last member disconnects"
            checked={voicemaster.autoCleanup}
            onChange={(autoCleanup) =>
              update((p) => ({
                ...p,
                voicemaster: { ...p.voicemaster, autoCleanup },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}

export function TicketsModule({
  config,
  update,
  channels,
  roles,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  roles: DiscordRoleOption[];
  prefix: string;
}) {
  const { tickets } = config;
  const [catInput, setCatInput] = useState("");

  const addCategory = () => {
    const clean = catInput.trim();
    if (!clean) return;
    update((p) => ({
      ...p,
      tickets: {
        ...p.tickets,
        categories: Array.from(new Set([...p.tickets.categories, clean])),
      },
    }));
    setCatInput("");
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Helpdesk"
        title="Ticketing System"
        description="Deploy dropdown ticket panels with private staff threads, claim buttons, and automated HTML transcript archives."
        command={`${prefix}ticket setup`}
        enabled={tickets.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, tickets: { ...p.tickets, enabled } }))
        }
      />

      <div className="panel panel-inner space-y-5 rounded-2xl p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ChannelField
            label="Ticket Panel Channel"
            value={tickets.panelChannel}
            onChange={(panelChannel) =>
              update((p) => ({
                ...p,
                tickets: { ...p.tickets, panelChannel },
              }))
            }
            channels={channels}
            placeholder="#open-a-ticket"
          />
          <ChannelField
            label="Tickets Category"
            kind="category"
            value={tickets.category}
            onChange={(category) =>
              update((p) => ({ ...p, tickets: { ...p.tickets, category } }))
            }
            channels={channels}
            placeholder="Support Category"
          />
          <RoleField
            label="Support Staff Role"
            value={tickets.staffRole}
            onChange={(staffRole) =>
              update((p) => ({ ...p, tickets: { ...p.tickets, staffRole } }))
            }
            roles={roles}
            placeholder="@Support Team"
          />
          <ChannelField
            label="Transcript Archive Channel"
            value={tickets.transcriptChannel}
            onChange={(transcriptChannel) =>
              update((p) => ({
                ...p,
                tickets: { ...p.tickets, transcriptChannel },
              }))
            }
            channels={channels}
            placeholder="#ticket-transcripts"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Panel Embed Title
            </span>
            <input
              type="text"
              value={tickets.panelTitle}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  tickets: { ...p.tickets, panelTitle: e.target.value },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[13px] text-white focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Max Open / User
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={tickets.maxOpenPerUser}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  tickets: {
                    ...p.tickets,
                    maxOpenPerUser: Number(e.target.value) || 1,
                  },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 font-mono text-[13px] text-white focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Panel Description
          </span>
          <textarea
            rows={2}
            value={tickets.panelDescription}
            onChange={(e) =>
              update((p) => ({
                ...p,
                tickets: { ...p.tickets, panelDescription: e.target.value },
              }))
            }
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink-950/90 p-3 text-[13px] text-zinc-100 focus:outline-none"
          />
        </label>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Dropdown Categories ({tickets.categories.length})
          </span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="Add ticket reason (e.g. Premium Claim)…"
              className="h-10 flex-1 rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-500"
            >
              <PlusIcon className="size-3.5" />
              Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tickets.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 text-[12px] text-zinc-200"
              >
                🎫 {cat}
                <button
                  type="button"
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      tickets: {
                        ...p.tickets,
                        categories: p.tickets.categories.filter(
                          (x) => x !== cat,
                        ),
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

        <ToggleRow
          title="Save HTML Transcripts on Close"
          description="Automatically export full message history and forward it to the transcript channel"
          checked={tickets.saveTranscripts}
          onChange={(saveTranscripts) =>
            update((p) => ({
              ...p,
              tickets: { ...p.tickets, saveTranscripts },
            }))
          }
        />
      </div>
    </div>
  );
}

export function LoggingModule({
  config,
  update,
  channels,
  logs,
  prefix,
}: {
  config: GuildConfig;
  update: UpdateConfig;
  channels: DiscordChannelOption[];
  logs: LogEntry[];
  prefix: string;
}) {
  const { logging } = config;
  const streams = [
    {
      eventKey: "security" as const,
      channelKey: "securityChannel" as const,
      title: "Security & Anti-Nuke Logs",
      desc: "Blocked nukes, rate-limit trips, rollbacks & whitelist edits",
    },
    {
      eventKey: "mod" as const,
      channelKey: "modChannel" as const,
      title: "Moderation Logs",
      desc: "Bans, kicks, timeouts, warnings & bulk message purges",
    },
    {
      eventKey: "messages" as const,
      channelKey: "messageChannel" as const,
      title: "Message Logs",
      desc: "Edited & deleted messages with author and attachment snapshots",
    },
    {
      eventKey: "members" as const,
      channelKey: "memberChannel" as const,
      title: "Member Logs",
      desc: "Joins, leaves, account age alerts, nickname & role changes",
    },
    {
      eventKey: "voice" as const,
      channelKey: "voiceChannel" as const,
      title: "Voice Activity Logs",
      desc: "Voice joins, switches, disconnects, server mutes & VoiceMaster",
    },
    {
      eventKey: "server" as const,
      channelKey: "serverChannel" as const,
      title: "Server & Channel Logs",
      desc: "Channel/role/webhook/emoji updates & dashboard config saves",
    },
  ];

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Telemetry"
        title="Audit Logging"
        description="Route chronological sub-500ms audit streams into a unified channel or dedicated per-category log rooms."
        command={`${prefix}logall #channel`}
        enabled={logging.enabled}
        onToggle={(enabled) =>
          update((p) => ({ ...p, logging: { ...p.logging, enabled } }))
        }
      />

      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <ChannelField
          label="Master Log-All Fallback Channel"
          value={logging.allChannel}
          onChange={(allChannel) =>
            update((p) => ({ ...p, logging: { ...p.logging, allChannel } }))
          }
          channels={channels}
          placeholder="#all-logs (used when a specific stream channel is blank)"
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {streams.map((s) => (
            <div
              key={s.eventKey}
              className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-semibold text-white">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-zinc-500">{s.desc}</p>
                </div>
                <Toggle
                  checked={logging.events[s.eventKey]}
                  onChange={(val) =>
                    update((p) => ({
                      ...p,
                      logging: {
                        ...p.logging,
                        events: { ...p.logging.events, [s.eventKey]: val },
                      },
                    }))
                  }
                  label={s.title}
                />
              </div>
              <ChannelField
                label="Dedicated Channel"
                value={logging[s.channelKey]}
                onChange={(val) =>
                  update((p) => ({
                    ...p,
                    logging: { ...p.logging, [s.channelKey]: val },
                  }))
                }
                channels={channels}
                placeholder={`#${s.eventKey}-logs`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Guild Audit Stream */}
      <div className="panel panel-inner overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
            Recent Server Audit Stream
          </span>
          <span className="font-mono text-[10px] text-emerald-400">
            ● synced
          </span>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto p-4 font-mono text-[11.5px]">
          {logs.length === 0 ? (
            <p className="py-6 text-center text-zinc-500">
              No server-specific events logged yet. Saving settings or running
              guard events will record entries here.
            </p>
          ) : (
            logs.map((l, idx) => (
              <div
                key={l.id ?? `${l.t}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-ink-950/60 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                      l.ok
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-brand-600/20 text-brand-300"
                    }`}
                  >
                    {l.t}
                  </span>
                  <span className="truncate text-zinc-300">{l.msg}</span>
                </div>
                {l.ts && (
                  <span className="text-[10px] text-zinc-600">
                    {new Date(l.ts).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function UtilityModule({
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
  const { autoResponders, giveaways } = config.utility;
  const [trigger, setTrigger] = useState("");
  const [response, setResponse] = useState("");
  const [match, setMatch] = useState<"exact" | "contains">("exact");

  const addResponder = () => {
    if (!trigger.trim() || !response.trim()) return;
    update((p) => ({
      ...p,
      utility: {
        ...p.utility,
        autoResponders: [
          ...p.utility.autoResponders,
          {
            id: `ar-${Date.now()}`,
            trigger: trigger.trim(),
            response: response.trim(),
            match,
          },
        ],
      },
    }));
    setTrigger("");
    setResponse("");
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Server Management · Engagement"
        title="AutoResponder & Giveaways"
        description="Automate instant custom keyword replies and manage high-engagement community giveaways."
        command={`${prefix}gstart 24h 1w Nitro`}
      />

      {/* AutoResponder */}
      <div className="panel panel-inner rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-brand-400">
            AutoResponder Rules ({autoResponders.length}/50)
          </p>
          <code className="font-mono text-[10px] text-zinc-400">
            {prefix}autoresponder add
          </code>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_165px_1.4fr_auto]">
          <input
            type="text"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="Trigger (e.g. ip, rules)"
            className="input-aqua"
          />
          <CustomSelect
            title="Trigger Match Mode"
            value={match}
            onChange={(val) => setMatch(val as "exact" | "contains")}
            options={[
              {
                value: "exact",
                label: "Exact Match",
                description: "Whole message matches trigger",
              },
              {
                value: "contains",
                label: "Contains",
                description: "Matches anywhere in message",
              },
            ]}
          />
          <input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addResponder();
              }
            }}
            placeholder="Bot reply message…"
            className="input-aqua"
          />
          <button
            type="button"
            onClick={addResponder}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-500"
          >
            <PlusIcon className="size-3.5" />
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {autoResponders.length === 0 ? (
            <p className="rounded-xl border border-white/[0.05] bg-ink-950/50 px-4 py-5 text-center text-[12.5px] text-zinc-500">
              No AutoResponder triggers configured yet.
            </p>
          ) : (
            autoResponders.map((ar) => (
              <div
                key={ar.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-ink-950/70 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-brand-950/60 px-2 py-0.5 font-mono text-[11.5px] text-brand-300">
                      {ar.trigger}
                    </code>
                    <span className="font-mono text-[9.5px] uppercase text-zinc-500">
                      {ar.match}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[12.5px] text-zinc-300">
                    → {ar.response}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update((p) => ({
                      ...p,
                      utility: {
                        ...p.utility,
                        autoResponders: p.utility.autoResponders.filter(
                          (x) => x.id !== ar.id,
                        ),
                      },
                    }))
                  }
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:border-brand-500/40 hover:text-brand-300"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Giveaways */}
      <div className="panel panel-inner space-y-4 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-white">
                Giveaway Engine
              </p>
              <span className="rounded border border-amber-400/35 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-amber-300">
                Pro Perks
              </span>
            </div>
            <p className="text-[12px] text-zinc-500">
              Host timed drops, role-requirement giveaways, bonus entries, and
              instant rerolls.
            </p>
          </div>
          <Toggle
            checked={giveaways.enabled}
            onChange={(enabled) =>
              update((p) => ({
                ...p,
                utility: {
                  ...p.utility,
                  giveaways: { ...p.utility.giveaways, enabled },
                },
              }))
            }
            label="Giveaway Engine"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RoleField
            label="Giveaway Manager Role"
            value={giveaways.managerRole}
            onChange={(managerRole) =>
              update((p) => ({
                ...p,
                utility: {
                  ...p.utility,
                  giveaways: { ...p.utility.giveaways, managerRole },
                },
              }))
            }
            roles={roles}
            placeholder="@Giveaway Host"
          />
          <RoleField
            label="Announcement Ping Role"
            value={giveaways.pingRole}
            onChange={(pingRole) =>
              update((p) => ({
                ...p,
                utility: {
                  ...p.utility,
                  giveaways: { ...p.utility.giveaways, pingRole },
                },
              }))
            }
            roles={roles}
            placeholder="@Giveaway Ping"
          />
          <RoleField
            label="Requirement Bypass Role"
            value={giveaways.bypassRole}
            onChange={(bypassRole) =>
              update((p) => ({
                ...p,
                utility: {
                  ...p.utility,
                  giveaways: { ...p.utility.giveaways, bypassRole },
                },
              }))
            }
            roles={roles}
            placeholder="@Booster / @VIP"
          />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Entry Emoji
            </span>
            <input
              type="text"
              maxLength={16}
              value={giveaways.emoji}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  utility: {
                    ...p.utility,
                    giveaways: {
                      ...p.utility.giveaways,
                      emoji: e.target.value,
                    },
                  },
                }))
              }
              className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-ink-950/90 px-3.5 text-[15px] text-white focus:outline-none"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
