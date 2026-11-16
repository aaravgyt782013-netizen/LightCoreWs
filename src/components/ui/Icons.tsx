import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6L12 3Z" />
      <path d="M9.2 12.1l2 2 3.6-3.9" />
    </svg>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V5m0 0a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 12 5Z" />
      <path d="M9.5 13h.01M14.5 13h.01M9.5 16h5" />
      <path d="M2 12v3M22 12v3" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.8 4a7 7 0 0 0 10.2 10.5Z" />
      <path d="M17 4.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.6 2.6 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.6 2.6 0 0 0 0-6Z" />
      <path d="M14 5v14" strokeDasharray="2 2.6" />
    </svg>
  );
}

export function VoiceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function DiscordIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.04.03C.53 9.05-.32 13.58.1 18.05a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.29 1.22-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1 0-.13l.37-.29a.07.07 0 0 1 .08-.01 14.2 14.2 0 0 0 12.06 0 .07.07 0 0 1 .08 0l.37.3a.08.08 0 0 1 0 .13c-.6.35-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6.01-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.68-3.55-13.65a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.95 2.42-2.15 2.42Zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42Z" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5 9 17l10.5-10.5" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function VerifiedIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 1.8l2.4 2.1 3.2-.3 1 3 2.8 1.6-1.1 3 1.1 3-2.8 1.6-1 3-3.2-.3L12 22.2l-2.4-2.1-3.2.3-1-3-2.8-1.6 1.1-3-1.1-3 2.8-1.6 1-3 3.2.3L12 1.8Z" />
      <path
        d="M8.6 12.2l2.3 2.3 4.5-4.6"
        stroke="#08080c"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12h3.5l2-6 3.5 12 2.5-8 2 2H21" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7M12 14.5v2.5" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13.2 2.5 4.8 13.3h5.6l-.9 8.2 8.6-11h-5.7l.8-8Z" />
    </svg>
  );
}

export const featureIcons: Record<
  string,
  (props: IconProps) => React.JSX.Element
> = {
  shield: ShieldIcon,
  bot: BotIcon,
  moon: MoonIcon,
  ticket: TicketIcon,
  voice: VoiceIcon,
};
