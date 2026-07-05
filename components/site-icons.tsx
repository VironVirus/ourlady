import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconFrame({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.7l3.1 1.9" />
    </IconFrame>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.8 10.2 12 4.4l7.2 5.8" />
      <path d="M6.8 9.6v9h10.4v-9" />
      <path d="M10.1 18.6v-4.4h3.8v4.4" />
    </IconFrame>
  );
}

export function GalleryIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M7 15.2l2.8-3 3.4 3.5 2.2-2.4 1.6 1.7" />
      <circle cx="9" cy="9" r="1.1" />
    </IconFrame>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 20s5-4.9 5-9a5 5 0 1 0-10 0c0 4.1 5 9 5 9Z" />
      <circle cx="12" cy="11" r="1.8" />
    </IconFrame>
  );
}

export function PriestIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6.8 18.6c1.3-2.7 3.2-4 5.2-4s3.9 1.3 5.2 4" />
      <path d="M12 11.3v3.4" />
    </IconFrame>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 4.2v15.6" />
      <path d="M8.2 8.2h7.6" />
    </IconFrame>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m12 4.5 1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8L12 4.5Z" />
    </IconFrame>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m6.5 9.5 5.5 5 5.5-5" />
    </IconFrame>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m14.8 6.5-5.6 5.5 5.6 5.5" />
    </IconFrame>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m9.2 6.5 5.6 5.5-5.6 5.5" />
    </IconFrame>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.5 7.5h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 16.5h15" />
    </IconFrame>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </IconFrame>
  );
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M4.5 13.8V10.2l8.2-3.6v10.8L4.5 13.8Z" />
      <path d="M12.7 8.5c2.3.2 4.1 2.1 4.1 4.5s-1.8 4.3-4.1 4.5" />
      <path d="m6.4 14.4 1.3 3.2" />
    </IconFrame>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="16" cy="10.2" r="2.1" />
      <path d="M5.2 18.2c.8-2.4 2.2-3.7 3.8-3.7 1.7 0 3 1.3 3.9 3.7" />
      <path d="M14.1 18.2c.5-1.7 1.5-2.7 2.8-2.7 1.2 0 2.1.9 2.7 2.7" />
    </IconFrame>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M7.5 3.8h6.7l3.3 3.3v12.1a1.8 1.8 0 0 1-1.8 1.8H7.5a1.8 1.8 0 0 1-1.8-1.8V5.6a1.8 1.8 0 0 1 1.8-1.8Z" />
      <path d="M14.2 3.8v3.6h3.3" />
      <path d="M8.6 12h6.8" />
      <path d="M8.6 15.4h6.8" />
    </IconFrame>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 19.3s-6.5-4.3-6.5-9.2c0-2.2 1.8-4 4-4 1.4 0 2.4.6 3.1 1.7.7-1.1 1.7-1.7 3.1-1.7 2.2 0 4 1.8 4 4 0 4.9-6.7 9.2-6.7 9.2Z" />
    </IconFrame>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="18" cy="5.5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="18.5" r="2" />
      <path d="m7.8 11 8.4-4.3" />
      <path d="m7.8 13 8.4 4.3" />
    </IconFrame>
  );
}

export function MessageIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M5.2 7.4A2.2 2.2 0 0 1 7.4 5.2h9.2a2.2 2.2 0 0 1 2.2 2.2v6.2a2.2 2.2 0 0 1-2.2 2.2H10l-3.8 3v-3H7.4a2.2 2.2 0 0 1-2.2-2.2V7.4Z" />
    </IconFrame>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconFrame>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.2v2" />
      <path d="M12 17.8v2" />
      <path d="m6.5 6.5 1.4 1.4" />
      <path d="m16.1 16.1 1.4 1.4" />
      <path d="M4.2 12h2" />
      <path d="M17.8 12h2" />
      <path d="m6.5 17.5 1.4-1.4" />
      <path d="m16.1 7.9 1.4-1.4" />
    </IconFrame>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path d="M15.7 4.8a7.3 7.3 0 1 0 3.5 11.7A8 8 0 0 1 15.7 4.8Z" />
    </IconFrame>
  );
}

export function DeviceIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="4.5" y="5" width="15" height="10.5" rx="2" />
      <path d="M9.2 19h5.6" />
      <path d="M12 15.5V19" />
    </IconFrame>
  );
}
