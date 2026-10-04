"use client";

import {
  MessageSquare,
  Bell,
  Moon,
  Sun,
  Settings,
  CircleUser,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { brand } from "@/lib/brand";

/**
 * DS dashboard top bar — brand + breadcrumb · utility icons + account
 * menu. Rebuilt from the Figma design (node 7:40) onto the
 * `.ds` token layer: no raw hexes, so it themes light/dark for free.
 */

// Shared icon-button styling so the account dropdown trigger matches the rest.
const iconButton =
  "grid size-8 place-items-center text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-5";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={iconButton}
    >
      {children}
    </button>
  );
}

// Both faces stay mounted and share one grid cell so the swap is a crossfade
// rather than a teleport — swapping the element instead would give React
// nothing to transition between. They turn the same way through the change, so
// it reads as one dial rotating rather than two icons trading places.
// The rotation is `motion-safe` (not overridden by `motion-reduce`) so under
// reduced motion the class is simply absent and the crossfade remains: gentler,
// not gone. Theme is toggled rarely, which is what buys it any motion at all.
const themeIcon =
  "col-start-1 row-start-1 transition-[opacity,rotate] duration-(--ds-duration-enter) ease-out";

function ThemeToggle({
  isDark,
  onToggleTheme,
}: {
  isDark: boolean;
  onToggleTheme?: () => void;
}) {
  return (
    <IconButton
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggleTheme}
    >
      <Sun
        aria-hidden
        className={`${themeIcon} ${
          isDark ? "opacity-100" : "opacity-0 motion-safe:-rotate-90"
        }`}
      />
      <Moon
        aria-hidden
        className={`${themeIcon} ${
          isDark ? "opacity-0 motion-safe:rotate-90" : "opacity-100"
        }`}
      />
    </IconButton>
  );
}

function AccountMenu({
  user,
  onSignOut,
  onSettings,
}: {
  user?: { name: string; email: string };
  onSignOut?: () => void;
  onSettings?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        title="Account"
        className={iconButton}
      >
        <CircleUser />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {user && (
          <>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={onSettings}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSettings}>Team settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSettings}>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Narrow-bar overflow: the utility actions that don't fit. */
function OverflowMenu({
  onMessages,
  onNotifications,
  onSettings,
}: {
  onMessages?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu" title="Menu" className={iconButton}>
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onSelect={onMessages}>
          <MessageSquare /> Messages
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onNotifications}>
          <Bell /> Notifications
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSettings}>
          <Settings /> Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopNav({
  isDark = false,
  onToggleTheme,
  breadcrumb,
  user,
  onSignOut,
  onSettings,
  onMessages,
  onNotifications,
}: {
  isDark?: boolean;
  onToggleTheme?: () => void;
  /** Breadcrumb text shown after the logo, e.g. "Projects / my-project". */
  breadcrumb?: string;
  /** Logged-in user — name and email shown in the account menu. */
  user?: { name: string; email: string };
  onSignOut?: () => void;
  onSettings?: () => void;
  onMessages?: () => void;
  onNotifications?: () => void;
}) {
  return (
    <header className="@container relative flex h-11 items-center border-b border-border-subtle bg-card px-3">
      {/* Left: logo mark + wordmark + breadcrumb */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Placeholder monogram — swap for the company's logo mark. */}
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground"
        >
          {brand.name.charAt(0)}
        </span>
        <span className="text-[15px] font-medium text-foreground">
          {brand.name}
        </span>
        {breadcrumb && (
          <span className="ml-1 hidden text-sm whitespace-nowrap text-muted-foreground @lg:inline">
            {breadcrumb}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="ml-auto flex shrink-0 items-center gap-3 @lg:gap-4">
        {/* Desktop utility cluster */}
        <div className="hidden items-center gap-1.5 @xl:flex">
          <IconButton label="Messages" onClick={onMessages}>
            <MessageSquare />
          </IconButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <div className="flex items-center gap-0.5">
            <IconButton label="Notifications" onClick={onNotifications}>
              <Bell />
            </IconButton>
            <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
            <IconButton label="Settings" onClick={onSettings}>
              <Settings />
            </IconButton>
            <AccountMenu user={user} onSignOut={onSignOut} onSettings={onSettings} />
          </div>
        </div>

        {/* Mobile cluster — theme + account stay; the rest folds into a menu */}
        <div className="flex items-center gap-1 @xl:hidden">
          <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
          <AccountMenu user={user} onSignOut={onSignOut} onSettings={onSettings} />
          <OverflowMenu
            onMessages={onMessages}
            onNotifications={onNotifications}
            onSettings={onSettings}
          />
        </div>
      </div>
    </header>
  );
}
