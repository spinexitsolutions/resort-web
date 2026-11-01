import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...rest }: P, children: React.ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const I = {
  dashboard: (p: P) => base(p, <><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>),
  calendar: (p: P) => base(p, <><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>),
  leads: (p: P) => base(p, <><rect x="3" y="3" width="5" height="18" rx="1.5" /><rect x="10" y="3" width="5" height="12" rx="1.5" /><rect x="17" y="3" width="4" height="8" rx="1.5" /></>),
  users: (p: P) => base(p, <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2" /></>),
  mail: (p: P) => base(p, <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>),
  bed: (p: P) => base(p, <><path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11" r="2" /></>),
  compass: (p: P) => base(p, <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  dining: (p: P) => base(p, <><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1.5-3 4-3 7h3" /></>),
  tag: (p: P) => base(p, <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>),
  image: (p: P) => base(p, <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>),
  quote: (p: P) => base(p, <><path d="M10 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l2-3V7zM20 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l2-3V7z" /></>),
  help: (p: P) => base(p, <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.6c0 1.6-2.4 2.1-2.4 3.4M12 17h.01" /></>),
  venue: (p: P) => base(p, <><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" /></>),
  settings: (p: P) => base(p, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>),
  menu: (p: P) => base(p, <path d="M4 7h16M4 12h16M4 17h16" />),
  close: (p: P) => base(p, <path d="M6 6l12 12M18 6 6 18" />),
  plus: (p: P) => base(p, <path d="M12 5v14M5 12h14" />),
  search: (p: P) => base(p, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  up: (p: P) => base(p, <path d="m6 15 6-6 6 6" />),
  down: (p: P) => base(p, <path d="m6 9 6 6 6-6" />),
  left: (p: P) => base(p, <path d="m15 6-6 6 6 6" />),
  right: (p: P) => base(p, <path d="m9 6 6 6-6 6" />),
  trash: (p: P) => base(p, <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />),
  edit: (p: P) => base(p, <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />),
  download: (p: P) => base(p, <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />),
  upload: (p: P) => base(p, <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />),
  external: (p: P) => base(p, <path d="M14 4h6v6M20 4 10 14M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />),
  logout: (p: P) => base(p, <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" />),
  star: (p: P) => base(p, <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />),
  check: (p: P) => base(p, <path d="m5 12 5 5 9-10" />),
  grip: (p: P) => base(p, <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>),
  sidebar: (p: P) => base(p, <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>),
  arrowUp: (p: P) => base(p, <path d="M7 17 17 7M8 7h9v9" />),
  phone: (p: P) => base(p, <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />),
  more: (p: P) => base(p, <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>),
  sparkle: (p: P) => base(p, <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />),
};
export type IconName = keyof typeof I;
