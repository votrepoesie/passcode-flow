"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteNav } from "@/app/site-nav";
import { ComponentPalette } from "./component-palette";
import { InstallCommand } from "@/app/install-command";
import registry from "@/registry.json";
import { toggleTheme, useTheme } from "@/app/use-theme";
import { Button, CopyButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PanelChat } from "@/components/ds/panel-chat";
import type { PanelChatMessage } from "@/components/ds/panel-chat";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { MultipleChoice } from "@/components/ai-elements/multiple-choice";
import { HtmlPreview } from "@/components/ai-elements/html-preview";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Toaster, toast } from "@/components/ui/toast";
import { Banner, type BannerItem } from "@/components/ui/banner";
import { Field, FieldErrorAction } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  CodeBlock,
  CodeBlockContainer,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockFilename,
  CodeBlockActions,
} from "@/components/ai-elements/code-block";
import { Mermaid } from "@/components/ai-elements/mermaid";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ds/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Bell,
  ChevronDown,
  Check,
  Play,
  Pause,
  ArrowRight,
  Search,
  Plus,
  Paperclip,
  AlertTriangle,
  X,
  Code,
  Workflow,
  Info,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Star,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label as UiLabel } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TopNav } from "@/components/ds/top-nav";
import { Search as SearchField } from "@/components/ds/search";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { DocList } from "@/components/ds/doc-list";
import { DocsNav } from "@/components/ds/docs-nav";
import { TableOfContents, type TocItem } from "@/components/ds/table-of-contents";

/**
 * Storybook-style playground for the design-system primitives.
 * Left rail = story list; canvas = live preview driven by the Controls panel;
 * below it, the full variant matrix and a copyable snippet.
 * Whole surface is under `.ds` so everything reads the brand tokens.
 */

type StoryId =
  | "banner"
  | "button"
  | "input"
  | "tabs"
  | "separator"
  | "breadcrumb"
  | "tooltip"
  | "avatar"
  | "dropdown"
  | "field"
  | "textarea"
  | "toast"
  | "select"
  | "dialog"
  | "spinner"
  | "switch"
  | "table"
  | "buttongroup"
  | "inputgroup"
  | "command"
  | "search"
  | "topnav"
  | "doclist"
  | "docsnav"
  | "toc"
  | "messagescroller"
  | "chat"
  | "panelchat"
  | "multiplechoice"
  | "codeblock"
  | "mermaid"
  | "htmlpreview"
  | "sidebar"
  | "accordion"
  | "alert"
  | "alertdialog"
  | "badge"
  | "card"
  | "checkbox"
  | "kbd"
  | "label"
  | "pagination"
  | "popover"
  | "progress"
  | "radiogroup"
  | "scrollarea"
  | "sheet"
  | "skeleton"
  | "slider"
  | "toggle";

const STORIES: { id: StoryId; name: string; blurb: string }[] = [
  { id: "accordion", name: "Accordion", blurb: "Stacked disclosure — one or many open, animated height" },
  { id: "alert", name: "Alert", blurb: "Inline message — default, success, warning, destructive" },
  { id: "alertdialog", name: "Alert dialog", blurb: "Confirmation modal — explicit cancel / action, no click-away" },
  { id: "avatar", name: "Avatar", blurb: "Round fallback, initials — sm/default/lg" },
  { id: "badge", name: "Badge", blurb: "Status pill — neutral, brand, success, warning, destructive" },
  { id: "banner", name: "Banner", blurb: "Nav-attached status tab — severity edge, overlays the page, retry flow" },
  { id: "breadcrumb", name: "Breadcrumb", blurb: "Path trail — muted links, foreground current page" },
  { id: "button", name: "Button", blurb: "Primary · brand cta · quiet secondary · ghost · link · icon" },
  { id: "buttongroup", name: "Button group", blurb: "Joined button cluster — segmented actions" },
  { id: "card", name: "Card", blurb: "Recessed panel — header, action, content, footer" },
  { id: "checkbox", name: "Checkbox", blurb: "Square check — checked, unchecked, disabled" },
  { id: "command", name: "Command", blurb: "Filterable command list — palette input + items" },
  { id: "dialog", name: "Dialog", blurb: "Modal — title, description, footer actions" },
  { id: "dropdown", name: "Dropdown menu", blurb: "Account menu — label, items, destructive" },
  { id: "field", name: "Field", blurb: "Built-in label + error on Input, Textarea, Select, Search — and <Field> for custom controls" },
  { id: "input", name: "Input", blurb: "Text field — default, filled, invalid, disabled" },
  { id: "inputgroup", name: "Input group", blurb: "Input with leading/trailing addons" },
  { id: "kbd", name: "Kbd", blurb: "Keyboard key hint — single key or chord" },
  { id: "label", name: "Label", blurb: "Form label — pairs with any control via htmlFor" },
  { id: "messagescroller", name: "Message scroller", blurb: "Smart transcript — follows edge only while reader is at it; anchors new turns; preserves position on prepend" },
  { id: "pagination", name: "Pagination", blurb: "Page links — previous / numbers / ellipsis / next" },
  { id: "popover", name: "Popover", blurb: "Anchored floating panel — inline, scales from trigger" },
  { id: "progress", name: "Progress", blurb: "Determinate bar — value 0–100" },
  { id: "radiogroup", name: "Radio group", blurb: "Single choice from a short list" },
  { id: "scrollarea", name: "Scroll area", blurb: "Custom-scrollbar viewport for fixed-height regions" },
  { id: "select", name: "Select", blurb: "Single-choice dropdown — trigger + popover list" },
  { id: "separator", name: "Separator", blurb: "Divider — horizontal + vertical, border token" },
  { id: "sheet", name: "Sheet", blurb: "Edge-docked panel — right, left, top, bottom" },
  { id: "skeleton", name: "Skeleton", blurb: "Loading placeholder — pulses when motion is allowed" },
  { id: "slider", name: "Slider", blurb: "Range input — single value or range" },
  { id: "spinner", name: "Spinner", blurb: "Indeterminate loading indicator — sizes" },
  { id: "switch", name: "Switch", blurb: "Pill toggle — primary fill when on" },
  { id: "table", name: "Table", blurb: "Editorial table — muted header on a rule, hairline rows, tabular numerics" },
  { id: "tabs", name: "Tabs", blurb: "Segmented (default) and underline (line) variants" },
  { id: "textarea", name: "Textarea", blurb: "Multi-line field — auto-size, disabled" },
  { id: "toast", name: "Toast", blurb: "Joined 320px panel on the inverse surface — one-line rows, errors open + persistent" },
  { id: "toggle", name: "Toggle", blurb: "Pressable on/off button + toggle group" },
  { id: "tooltip", name: "Tooltip", blurb: "Inverted label on hover" },
];

const COMPOSED: { id: StoryId; name: string; blurb: string }[] = [
  { id: "chat", name: "Chat", blurb: "AI Elements — conversation, streaming message, prompt composer" },
  { id: "panelchat", name: "Panel chat", blurb: "The composer DS ships in the platform — three presentations (collapsed pill / floating card / docked right sidebar) with one prop shape" },
  { id: "multiplechoice", name: "Multiple choice", blurb: "In-chat question card — option ledger + typed answer; answered/awaiting states" },
  { id: "codeblock", name: "Code block", blurb: "In-chat fenced code — syntax highlight + copy (Streamdown)" },
  { id: "mermaid", name: "Mermaid", blurb: "In-chat diagram — flowchart/sequence rendered by Streamdown" },
  { id: "htmlpreview", name: "HTML preview", blurb: "In-chat UI mockup — ```mockup fence rendered as a sandboxed, brand-themed preview" },
  { id: "search", name: "Search", blurb: "Filter field — magnifier, clear button; built on Input Group" },
  { id: "topnav", name: "Top nav", blurb: "Dashboard bar — project label · utility icons · account menu" },
  { id: "sidebar", name: "Checklist sidebar", blurb: "Checklist rail — grouped, collapsible; state tags (review = brand); auto-complete footer" },
  { id: "doclist", name: "Doc list", blurb: "Doc-list card — nested groups; collapses to active on hover past 10 docs" },
  { id: "docsnav", name: "Docs nav", blurb: "Docs side nav — composes doc list + on-this-page TOC" },
  { id: "toc", name: "Table of contents", blurb: "On this page — anchors + scrollspy; auto-scans the article" },
];

// Registry items each story installs (`npx shadcn add …/r/<name>.json`).
// Stories without a published item (code block, mermaid, checklist sidebar)
// are left out; names not in registry.json are dropped so this can't drift.
const REGISTRY_NAMES = new Set(registry.items.map((i) => i.name));
const STORY_REGISTRY: Partial<Record<StoryId, string[]>> = Object.fromEntries(
  Object.entries({
    avatar: ["avatar"],
    banner: ["banner"],
    breadcrumb: ["breadcrumb"],
    button: ["button"],
    buttongroup: ["button-group"],
    command: ["command"],
    dialog: ["dialog"],
    dropdown: ["dropdown-menu"],
    field: ["field"],
    input: ["input"],
    inputgroup: ["input-group"],
    messagescroller: ["message-scroller"],
    select: ["select"],
    separator: ["separator"],
    spinner: ["spinner"],
    switch: ["switch"],
    table: ["table"],
    tabs: ["tabs"],
    textarea: ["textarea"],
    toast: ["toast"],
    tooltip: ["tooltip"],
    accordion: ["accordion"],
    alert: ["alert"],
    alertdialog: ["alert-dialog"],
    badge: ["badge"],
    card: ["card"],
    checkbox: ["checkbox"],
    kbd: ["kbd"],
    label: ["label"],
    pagination: ["pagination"],
    popover: ["popover"],
    progress: ["progress"],
    radiogroup: ["radio-group"],
    scrollarea: ["scroll-area"],
    sheet: ["sheet"],
    skeleton: ["skeleton"],
    slider: ["slider"],
    toggle: ["toggle", "toggle-group"],
    chat: ["conversation", "message", "prompt-input"],
    panelchat: ["panel-chat"],
    multiplechoice: ["multiple-choice"],
    htmlpreview: ["html-preview"],
    search: ["search"],
    topnav: ["top-nav"],
    doclist: ["doc-list"],
    docsnav: ["docs-nav"],
    toc: ["table-of-contents"],
  } satisfies Partial<Record<StoryId, string[]>>).map(([id, names]) => [
    id,
    names.filter((n) => REGISTRY_NAMES.has(n)),
  ])
);

/* ── small presentational helpers ─────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-medium text-label text-muted-foreground">
      {children}
    </span>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[220px] flex-wrap items-center gap-4 border border-border bg-background p-10">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6 border-t border-border py-4 first:border-t-0">
      <div className="w-28 shrink-0">
        <Label>{label}</Label>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ControlSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label>{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex min-w-28 items-center justify-between gap-2 border border-border bg-transparent px-2 py-1.5 font-medium text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {value}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-28">
          {options.map((o) => (
            <DropdownMenuItem
              key={o}
              onSelect={() => onChange(o)}
              className="justify-between font-medium text-xs"
            >
              {o}
              {o === value && <Check className="size-3.5" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ControlToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <Label>{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto border border-border bg-card p-4 font-mono text-xs leading-relaxed text-foreground">
      {code}
    </pre>
  );
}

/** Shown on every primitive with built-in error handling. */
function ErrorsPanel({ example }: { example: string }) {
  return (
    <Panel title="Errors">
      <div className="flex flex-col">
        <Row label="api-agnostic">
          <span className="text-sm">
            error is a plain string — any non-empty string shows it; undefined or &quot;&quot; clears it.
            Where it comes from (client validation, an API response, a form library) is up to you.
          </span>
        </Row>
      </div>
      <div className="mt-4">
        <Snippet code={example} />
      </div>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  // `min-w-0` lets Panel shrink below its intrinsic min-content when it's a
  // grid/flex item — otherwise a Snippet with a long import line would force
  // the enclosing grid wider than the story column and trigger a horizontal
  // page scroll when the docked PanelChat narrows the section.
  return (
    <div className="min-w-0">
      <Label>{title}</Label>
      <div className="mt-4 min-w-0">{children}</div>
    </div>
  );
}

/* ── stories ──────────────────────────────────────────────────────────── */

const BTN_VARIANTS = ["default", "cta", "secondary", "ghost", "link", "destructive"] as const;
const BTN_SIZES = ["sm", "default"] as const;

function ButtonStory() {
  const [variant, setVariant] = useState<(typeof BTN_VARIANTS)[number]>("default");
  const [size, setSize] = useState<(typeof BTN_SIZES)[number]>("default");
  const [label, setLabel] = useState("Run assessment");
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="grid gap-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <Panel title="Preview">
          <Canvas>
            <Button variant={variant} size={size} disabled={disabled}>
              {label}
            </Button>
          </Canvas>
        </Panel>
        <Panel title="Controls">
          <div className="flex flex-col gap-4 border border-border bg-card p-4">
            <label className="flex items-center justify-between gap-4">
              <Label>label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-8 w-40 py-1 text-xs"
              />
            </label>
            <ControlSelect label="variant" value={variant} options={BTN_VARIANTS} onChange={setVariant} />
            <ControlSelect label="size" value={size} options={BTN_SIZES} onChange={setSize} />
            <ControlToggle label="disabled" value={disabled} onChange={setDisabled} />
          </div>
        </Panel>
      </div>

      <Panel title="All variants">
        <div className="border border-border px-6">
          {BTN_VARIANTS.map((v) => (
            <Row key={v} label={v}>
              {BTN_SIZES.map((s) => (
                <Button key={s} variant={v} size={s}>
                  {v === "link" ? "Link" : "Button"}
                </Button>
              ))}
              <Button variant={v} disabled>
                Disabled
              </Button>
            </Row>
          ))}
        </div>
      </Panel>

      <Panel title="With icon">
        <p className="mb-4 max-w-[520px] text-base font-light text-muted-foreground">
          Pass any element via <span className="font-mono text-xs">icon</span> —
          it sits inline with the label, sized to 16px by the button&apos;s own
          rules. Use <span className="font-mono text-xs">iconPosition=&quot;end&quot;</span>{" "}
          for a trailing icon.
        </p>
        <div className="border border-border px-6">
          <Row label="leading">
            <Button icon={<Play />}>Resume</Button>
            <Button variant="cta" icon={<Pause />}>
              In progress
            </Button>
            <Button variant="secondary" icon={<Bell />}>
              Notify
            </Button>
          </Row>
          <Row label="trailing">
            <Button icon={<ArrowRight />} iconPosition="end">
              Continue
            </Button>
            <Button variant="cta" icon={<Pause />} iconPosition="end">
              In progress
            </Button>
          </Row>
        </div>
        <div className="mt-4">
          <Snippet
            code={`<Button variant="cta" icon={<Pause />}>In progress</Button>\n<Button icon={<ArrowRight />} iconPosition="end">Continue</Button>`}
          />
        </div>
      </Panel>

      <Panel title="Copy button">
        <p className="mb-4 max-w-[520px] text-base font-light text-muted-foreground">
          <span className="font-mono text-xs">CopyButton</span> is the one copy-to-clipboard
          control — a ghost icon button that flips to a check for ~2s after copying.
          Use it everywhere a copy affordance appears (code blocks, diagrams, mockups,
          fields) so the glyph, sizing, and hover read the same. Pass{" "}
          <span className="font-mono text-xs">value</span>; override{" "}
          <span className="font-mono text-xs">size</span> /{" "}
          <span className="font-mono text-xs">variant</span> as needed.
        </p>
        <div className="border border-border px-6">
          <Row label="sizes">
            <CopyButton value="copied from the xs button" size="icon-xs" />
            <CopyButton value="copied from the sm button" size="icon-sm" />
            <CopyButton value="copied from the default button" size="icon" />
          </Row>
          <Row label="in context">
            <span className="font-mono text-xs text-muted-foreground">npm i @acme/ui</span>
            <CopyButton value="npm i @acme/ui" size="icon-xs" aria-label="Copy command" />
          </Row>
        </div>
        <div className="mt-4">
          <Snippet
            code={`import { CopyButton } from "@/components/ui/button";\n\n<CopyButton value={code} />\n<CopyButton value={cmd} size="icon-xs" aria-label="Copy command" />`}
          />
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`<Button variant="${variant}" size="${size}"${disabled ? " disabled" : ""}>\n  ${label}\n</Button>`}
        />
      </Panel>
    </div>
  );
}

function InputStory() {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search the library…");

  return (
    <div className="grid gap-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <Panel title="Preview">
          <Canvas>
            <div className="w-full max-w-[360px]">
              <Input
                value={value}
                placeholder={placeholder}
                aria-invalid={invalid}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </Canvas>
        </Panel>
        <Panel title="Controls">
          <div className="flex flex-col gap-4 border border-border bg-card p-4">
            <label className="flex items-center justify-between gap-4">
              <Label>placeholder</Label>
              <Input
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                className="h-8 w-40 py-1 text-xs"
              />
            </label>
            <ControlToggle label="aria-invalid" value={invalid} onChange={setInvalid} />
            <ControlToggle label="disabled" value={disabled} onChange={setDisabled} />
          </div>
        </Panel>
      </div>

      <Panel title="States">
        <div className="grid max-w-[360px] gap-4">
          <div className="grid gap-1.5">
            <Label>default</Label>
            <Input placeholder="Search the library…" />
          </div>
          <div className="grid gap-1.5">
            <Label>filled</Label>
            <Input defaultValue="content-consumption" />
          </div>
          <div className="grid gap-1.5">
            <Label>with label + hint</Label>
            <Input label="Close date" hint="MM/DD/YYYY" defaultValue="09/30/2026" />
          </div>
          <div className="grid gap-1.5">
            <Label>error (built in)</Label>
            <Input label="Owner email" error="Add the domain, like .co" defaultValue="alex@acme" />
          </div>
          <div className="grid gap-1.5">
            <Label>disabled</Label>
            <Input disabled placeholder="Disabled" />
          </div>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`<Input\n  placeholder="${placeholder}"${invalid ? "\n  aria-invalid" : ""}${disabled ? "\n  disabled" : ""}\n/>\n\n// Built-in error handling — label line, a11y wired:\n<Input label="Owner email" error={errors.owner} value={owner} onChange={…} />`}
        />
      </Panel>

      <ErrorsPanel
        example={`// API response
<Input label="Owner email" error={serverErrors.owner?.message} … />

// client validation
<Input label="Owner email" error={clientErrors.owner} … />

// React Hook Form
<Input label="Owner email" error={formState.errors.owner?.message} … />`}
      />
    </div>
  );
}

const TABS_VARIANTS = ["default", "line"] as const;

function TabsStory() {
  const [variant, setVariant] = useState<(typeof TABS_VARIANTS)[number]>("default");

  return (
    <div className="grid gap-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <Panel title="Preview">
          <Canvas>
            <Tabs defaultValue="chat" className="w-full max-w-[440px]">
              <TabsList variant={variant}>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="questions">Questions list</TabsTrigger>
                <TabsTrigger value="proposal">Proposal</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="pt-4 text-base">
                Chat pane.
              </TabsContent>
              <TabsContent value="questions" className="pt-4 text-base">
                Questions list pane.
              </TabsContent>
              <TabsContent value="proposal" className="pt-4 text-base">
                Proposal pane.
              </TabsContent>
            </Tabs>
          </Canvas>
        </Panel>
        <Panel title="Controls">
          <div className="flex flex-col gap-4 border border-border bg-card p-4">
            <ControlSelect label="variant" value={variant} options={TABS_VARIANTS} onChange={setVariant} />
          </div>
        </Panel>
      </div>

      <Panel title="Usage">
        <Snippet
          code={`<Tabs defaultValue="chat">\n  <TabsList${variant === "line" ? ' variant="line"' : ""}>\n    <TabsTrigger value="chat">Chat</TabsTrigger>\n    <TabsTrigger value="questions">Questions list</TabsTrigger>\n    <TabsTrigger value="proposal">Proposal</TabsTrigger>\n  </TabsList>\n  <TabsContent value="chat">…</TabsContent>\n</Tabs>`}
        />
      </Panel>
    </div>
  );
}

function SeparatorStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Horizontal">
        <div className="max-w-[360px]">
          <p className="text-base">Discovery</p>
          <Separator className="my-3" />
          <p className="text-base text-muted-foreground">
            Findings from the assessment phase.
          </p>
        </div>
      </Panel>
      <Panel title="Vertical">
        <div className="flex h-6 items-center gap-4 font-medium text-xs text-muted-foreground">
          <span>Rules</span>
          <Separator orientation="vertical" />
          <span>Roles</span>
          <Separator orientation="vertical" />
          <span>Workflows</span>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Separator />\n<Separator orientation="vertical" />`} />
      </Panel>
    </div>
  );
}

function BreadcrumbStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">vs-assess</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Discovery</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="#">Projects</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator>/</BreadcrumbSeparator>\n    <BreadcrumbItem>\n      <BreadcrumbPage>Discovery</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`}
        />
      </Panel>
    </div>
  );
}

const wait = (ms: number, fail = false) =>
  new Promise<void>((res, rej) => setTimeout(fail ? rej : res, ms));

const TOAST_DEMOS: { label: string; run: () => void }[] = [
  { label: "Message", run: () => toast.message({ eyebrow: "Clipboard", title: "Link copied" }) },
  {
    label: "Success + action",
    run: () =>
      toast.success({
        eyebrow: "Share",
        title: "Shared with Sam Lee",
        description: "They can now edit Website Redesign.",
        action: { label: "Undo", onClick: () => toast.message({ eyebrow: "Share", title: "Access removed" }) },
      }),
  },
  {
    label: "Error + retry",
    run: () =>
      toast.error({
        eyebrow: "Sync",
        title: "Couldn't sync Website Redesign",
        description: "Connection lost at 2:14 PM. Your last 3 edits are saved on this device.",
        action: {
          label: "Retry",
          onClick: () =>
            toast.promise(wait(1400), {
              loading: { eyebrow: "Sync", title: "Retrying sync…" },
              success: { eyebrow: "Sync", title: "Website Redesign is up to date" },
              error: { eyebrow: "Sync", title: "Still offline" },
            }),
        },
      }),
  },
  {
    label: "Error (no action)",
    run: () =>
      toast.error({
        eyebrow: "Export · 413",
        title: "Export failed",
        description: "Photos.zip is 31 MB — the limit is 25 MB. Try exporting fewer files at a time.",
      }),
  },
  {
    label: "Promise ✓",
    run: () =>
      toast.promise(wait(1800), {
        loading: { eyebrow: "Report", title: "Generating report…" },
        success: { eyebrow: "Report", title: "Report ready", description: "12 pages across 4 sections." },
        error: { eyebrow: "Report", title: "Report failed" },
      }),
  },
  {
    label: "Promise ✕",
    run: () =>
      toast.promise(wait(2000, true), {
        loading: { eyebrow: "Import", title: "Importing contacts…" },
        success: { eyebrow: "Import", title: "Contacts imported" },
        error: {
          eyebrow: "Row 1,204",
          title: "Import stopped at row 1,204",
          description: "Date “31/13/2026” isn't a valid date. 1,203 rows were imported.",
          action: { label: "View row", onClick: () => {} },
        },
      }),
  },
];

const FIELD_INITIAL = { owner: "alex@acme", closeDate: "31/13/2026", category: "", notes: "This project covers the redesign of the onboarding flow, including the welcome screens, account setup, and the first-run checklist. Research is complete and the first round of designs is ready for review by the end of the month." };
const NOTES_LIMIT = 200;

function validateProject(v: typeof FIELD_INITIAL) {
  const e: Partial<Record<keyof typeof FIELD_INITIAL, string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.owner)) e.owner = "Add the domain, like .co";
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.closeDate);
  const d = m ? new Date(+m[3], +m[1] - 1, +m[2]) : null;
  if (!m || !d || d.getMonth() !== +m[1] - 1 || d.getDate() !== +m[2]) e.closeDate = "Use MM/DD/YYYY — there's no month 31";
  if (!v.category) e.category = "Pick a category";
  if (v.notes.length > NOTES_LIMIT) e.notes = `${v.notes.length - NOTES_LIMIT} characters over the limit`;
  return e;
}

function FieldStory() {
  const [v, setV] = useState(FIELD_INITIAL);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("Onboarding");
  const [searchFails, setSearchFails] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const retrySearch = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setSearchFails(false);
    }, 1200);
  };
  const errors = validateProject(v);
  const show = (k: keyof typeof FIELD_INITIAL) => (submitted || touched[k] ? errors[k] : undefined);
  const set = (k: keyof typeof FIELD_INITIAL) => (value: string) => setV((s) => ({ ...s, [k]: value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="flex flex-col gap-6 border border-border bg-background p-8">
          {/* Every control below uses its OWN label / error props — no wrapper. */}
          <SearchField
            label="Search projects"
            value={query}
            onValueChange={setQuery}
            placeholder="Search projects…"
            error={searchFails && query ? (retrying ? "Retrying…" : "Couldn't search — connection lost.") : undefined}
            errorAction={retrying ? undefined : <FieldErrorAction onClick={retrySearch}>Retry</FieldErrorAction>}
          />
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Owner email"
              error={show("owner")}
              type="email"
              value={v.owner}
              onChange={(e) => set("owner")(e.target.value)}
              onBlur={blur("owner")}
            />
            <Select value={v.category} onValueChange={(c) => { set("category")(c); blur("category")(); }}>
              <SelectTrigger label="Category" error={show("category")} className="w-full" onBlur={blur("category")}>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {["General", "Design", "Content", "Operations"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            label="Close date"
            hint="MM/DD/YYYY"
            error={show("closeDate")}
            inputMode="numeric"
            value={v.closeDate}
            onChange={(e) => set("closeDate")(e.target.value)}
            onBlur={blur("closeDate")}
          />
          <Textarea
            label="Notes"
            error={show("notes")}
            meta={<Label>{v.notes.length}/{NOTES_LIMIT}</Label>}
            rows={3}
            value={v.notes}
            onChange={(e) => set("notes")(e.target.value)}
            onBlur={blur("notes")}
          />
          {/* A custom control: <Field> directly gives it the same layout. */}
          <Field label="Budget" hint="Slider · custom control">
            <input type="range" min={0} max={10} defaultValue={4.6} step={0.1} className="w-full accent-(--foreground)" aria-label="Budget in thousands" />
          </Field>
          <div className="flex gap-3">
            <Button onClick={() => setSubmitted(true)}>Save project</Button>
            <Button variant="ghost" onClick={() => { setV(FIELD_INITIAL); setTouched({}); setSubmitted(false); setSearchFails(true); setRetrying(false); }}>
              Reset
            </Button>
          </div>
        </div>
      </Panel>
      <Panel title="Behaviour">
        <div className="flex flex-col">
          <Row label="layout">Error sits in the label row, right-aligned, in the hint&apos;s place; the label turns red. Nothing below moves</Row>
          <Row label="built in">Input, Textarea, SelectTrigger and Search take label / hint / error / errorAction / meta directly — no wrapper; id, aria-invalid, aria-describedby are automatic. Without them they&apos;re bare controls</Row>
          <Row label="custom">Wrap anything else in &lt;Field&gt; for the same layout</Row>
          <Row label="api-agnostic">error is a plain string — any non-empty string shows it; undefined or &quot;&quot; clears it. Where it comes from (client validation, an API response, a form library) is up to you</Row>
          <Row label="timing">Show after blur or submit; clear the moment the value is valid</Row>
          <Row label="copy">Say what&apos;s wrong and how to fix it, in one line for the column — “Use MM/DD/YYYY — there&apos;s no month 31”. A wrapping message grows the label row</Row>
          <Row label="empty">“No results” is an empty state, not an error — never pass it as error</Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`// Standard: the primitives own it
<Input label="Close date" hint="MM/DD/YYYY" error={touched ? errors.closeDate : undefined} … />
<SelectTrigger label="Category" error={errors.category}>…</SelectTrigger>
<Search label="Search projects" error={failed ? "Couldn't search — connection lost." : undefined}
  errorAction={<FieldErrorAction onClick={retry}>Retry</FieldErrorAction>} … />

// API-agnostic: error is just a string (undefined or "" = no error).
// Map your API's shape to a message yourself:
<Textarea label="Notes" error={serverErrors.notes?.message} … />
<Input label="Close date" error={clientErrors.closeDate ?? messageFor(serverErrors.closeDate)} … />
<Input label="Owner email" error={formState.errors.owner?.message} … />   // React Hook Form

// Custom control: wrap it
import { Field } from "@/components/ui/field"
<Field label="Budget" error={errors.target}>
  <MySlider … />
</Field>`}
        />
      </Panel>
    </div>
  );
}

type BannerDemo = Omit<BannerItem, "onDismiss" | "onResolved"> & { dismissible: boolean };

function BannerStory() {
  const [ids, setIds] = useState<string[]>(["offline"]);
  const [retryOk, setRetryOk] = useState(true);
  const remove = (id: string) => setIds((l) => l.filter((x) => x !== id));
  const attempt = () => wait(1400, !retryOk);

  const DEMOS: BannerDemo[] = [
    {
      id: "offline",
      severity: "error",
      eyebrow: "Offline",
      title: "You're offline — edits are saved on this device",
      description: "3 edits to Website Redesign will sync when you reconnect.",
      action: { label: "Retry", onClick: attempt, pendingLabel: "Reconnecting…", resolvedLabel: "Back online — 3 edits synced" },
      dismissible: false,
    },
    {
      id: "salesforce",
      severity: "error",
      eyebrow: "Google Drive",
      title: "Google Drive disconnected — files are from Sep 26",
      description: "The access token expired. Files shown are from the last successful sync.",
      action: { label: "Reconnect", onClick: attempt, pendingLabel: "Reconnecting Google Drive…", resolvedLabel: "Google Drive reconnected — importing" },
      dismissible: true,
    },
    {
      id: "payment",
      severity: "error",
      eyebrow: "Billing",
      title: "Payment failed — workspace locks Oct 1",
      description: "The card ending 4242 was declined. Update it to keep editing.",
      action: { label: "Update card", onClick: attempt, pendingLabel: "Checking card…", resolvedLabel: "Payment received — thanks" },
      dismissible: true,
    },
    {
      id: "readonly",
      severity: "warning",
      eyebrow: "Read-only",
      title: "Sam Lee is editing this project — you're in read-only",
      description: "You'll be able to edit when they're done, or you can ask for access.",
      action: { label: "Request edit", onClick: attempt, pendingLabel: "Asking Sam…", resolvedLabel: "Sam handed over editing" },
      dismissible: true,
    },
  ];

  const items: BannerItem[] = DEMOS.filter((d) => ids.includes(d.id)).map(({ dismissible, ...d }) => ({
    ...d,
    onDismiss: dismissible ? () => remove(d.id) : undefined,
    onResolved: () => remove(d.id),
  }));

  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="overflow-hidden border border-border">
          <TopNav breadcrumb="Projects / Website Redesign" />
          <Banner items={items} />
          <div className="flex h-72 flex-col gap-2 bg-background px-10 pt-16">
            <Label>Plan · Last edited 2:14 PM</Label>
            <h3 className="text-2xl font-medium tracking-tight">Website Redesign</h3>
            <p className="max-w-[52ch] text-body text-muted-foreground">
              The banner overlays the page — nothing here moves when it appears.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {DEMOS.map((d) => (
            <Button
              key={d.id}
              variant="secondary"
              size="sm"
              className="border border-border"
              onClick={() => setIds((l) => (l.includes(d.id) ? l : [...l, d.id]))}
            >
              {d.eyebrow}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setIds([])}>
            Clear
          </Button>
          <label className="ml-auto flex cursor-pointer items-center gap-2">
            <Label>Retry succeeds</Label>
            <Switch checked={retryOk} onCheckedChange={setRetryOk} />
          </label>
        </div>
      </Panel>
      <Panel title="Behaviour">
        <div className="flex flex-col">
          <Row label="placement">Directly after TopNav; hangs from its edge and overlays — no layout shift</Row>
          <Row label="several">Errors before warnings; the rest show as “+N more”, listed on hover / focus / tap</Row>
          <Row label="action">Return a Promise → pending, then resolved (success, then onResolved) or “Still failing”</Row>
          <Row label="dismiss">Only when onDismiss is passed — offline-style states can’t be dismissed</Row>
          <Row label="vs toast">Banner = a state that is still true · Toast = an event that just happened</Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`import { Banner } from "@/components/ui/banner"

<div className="sticky top-0 z-40">
  <TopNav />
  <Banner
    items={offline ? [{
      id: "offline",
      severity: "error",
      eyebrow: "Offline",
      title: "You're offline — edits are saved on this device",
      action: { label: "Retry", onClick: reconnect, pendingLabel: "Reconnecting…", resolvedLabel: "Back online" },
      onResolved: () => setOffline(false),
    }] : []}
  />
</div>`}
        />
      </Panel>
    </div>
  );
}

function ToastStory() {
  // Leaving the story clears the panel so toasts don't linger over other stories.
  useEffect(() => () => toast.clear(), []);
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="flex flex-wrap gap-2">
            {TOAST_DEMOS.map((d) => (
              <Button key={d.label} variant="secondary" size="sm" className="border border-border" onClick={d.run}>
                {d.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={toast.clear}>
              Clear
            </Button>
          </div>
        </Canvas>
        <Toaster />
      </Panel>
      <Panel title="Behaviour">
        <div className="flex flex-col">
          <Row label="message">One line · 5s · pauses on hover/focus · detail (if any) on hover, focus or tap</Row>
          <Row label="success">Same as message; its action (e.g. Undo) sits on the row, never behind a hover</Row>
          <Row label="error">Arrives open · actions in the detail · never auto-dismisses</Row>
          <Row label="loading">Spinner + indeterminate hairline; `promise` swaps it in place</Row>
          <Row label="surface">Inverse — dark on the light page, light on the dark page (.ds-inverse)</Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`import { Toaster, toast } from "@/components/ui/toast"

// once, inside your .ds scope
<Toaster />

toast.success({ title: "Shared with Sam Lee", action: { label: "Undo", onClick: undo } })
toast.error({ eyebrow: "Sync", title: "Couldn't sync", description: "Connection lost.", action: { label: "Retry", onClick: retry } })
toast.promise(save(), {
  loading: { title: "Saving…" },
  success: { title: "Saved" },
  error: { title: "Couldn't save" },
})`}
        />
      </Panel>
    </div>
  );
}

function TooltipStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Tooltip>
            <TooltipTrigger className="grid size-8 place-items-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Bell className="size-5" />
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <span className="font-medium text-xs text-muted-foreground">
            ← hover the bell
          </span>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<Tooltip>\n  <TooltipTrigger>…</TooltipTrigger>\n  <TooltipContent>Notifications</TooltipContent>\n</Tooltip>`}
        />
      </Panel>
    </div>
  );
}

function AvatarStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Sizes">
        <Canvas>
          <Avatar size="sm">
            <AvatarFallback>VL</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>VL</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>VL</AvatarFallback>
          </Avatar>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Avatar>\n  <AvatarFallback>VL</AvatarFallback>\n</Avatar>`} />
      </Panel>
    </div>
  );
}

function DropdownStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex min-w-28 items-center justify-between gap-2 border border-border bg-transparent px-2 py-1.5 font-medium text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              Account
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-(--ds-duration-enter) ease-out group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm">Alex Morgan</span>
                <span className="font-mono text-label text-muted-foreground">
                  alex@acme.com
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Team settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<DropdownMenu>\n  <DropdownMenuTrigger asChild>…</DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>Profile</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`}
        />
      </Panel>
    </div>
  );
}

function NavStory({
  dark,
  onToggleTheme,
}: {
  dark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        {/* Full-bleed so the bar reads at real width. Moon icon toggles theme. */}
        <div className="border border-border">
          <TopNav isDark={dark} onToggleTheme={onToggleTheme} />
          <div className="grid min-h-[160px] place-items-center bg-background p-10">
            <span className="font-medium text-xs text-muted-foreground">
              Page content
            </span>
          </div>
        </div>
        <a
          href="/playground/top-nav"
          className="mt-3 inline-block font-medium text-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open full page ↗
        </a>
      </Panel>

      <Panel title="Built from">
        <div className="flex flex-wrap gap-2">
          {["logo mark", "icon buttons", "moon → theme", "DropdownMenu (account)"].map((p) => (
            <span
              key={p}
              className="border border-border bg-card px-2.5 py-1 font-medium text-label text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet code={`import { TopNav } from "@/components/ds/top-nav";\n\n<TopNav />`} />
      </Panel>
    </div>
  );
}

/* ── Checklist sidebar (composed) ──────────────────────────────────────────
   Live decision rail — grouped + collapsible sections, a right-aligned
   state tag, and an auto-complete footer. Ported from an earlier
   prototype; still a page surface (not yet a registry component). Full-page
   play at /playground/checklist-sidebar. */
type SidebarDecisionState = "notstarted" | "inprogress" | "complete" | "review";
const SIDEBAR_CATEGORY_ORDER = ["Define", "Plan", "Build", "Launch"] as const;
const SIDEBAR_DECISIONS: { label: string; state: SidebarDecisionState; category: string }[] = [
  { label: "Goals", state: "complete", category: "Define" },
  { label: "Audience", state: "complete", category: "Define" },
  { label: "Scope", state: "complete", category: "Plan" },
  { label: "Content & design", state: "complete", category: "Plan" },
  { label: "Timeline", state: "inprogress", category: "Plan" },
  { label: "Budget", state: "review", category: "Build" },
  { label: "Risks", state: "notstarted", category: "Build" },
  { label: "Testing", state: "notstarted", category: "Launch" },
  { label: "Launch review", state: "notstarted", category: "Launch" },
];

/** Right-aligned status tag — only the two states needing attention carry one.
 * `review` is brand; in-progress shimmers only on the open row. Complete +
 * not-started stay quiet, so a rail of settled rows isn't a wall of labels. */
function SidebarDecisionTag({ state, active }: { state: SidebarDecisionState; active?: boolean }) {
  const base = "shrink-0 rounded-sm px-1.5 py-0.5 font-medium text-[10px] leading-none";
  if (state === "review") return <span className={cn(base, "bg-cta text-cta-foreground")}>Review</span>;
  if (state === "inprogress")
    return <span className={cn(base, active ? "text-shimmer" : "text-muted-foreground")}>In progress</span>;
  return null;
}

function SidebarStory() {
  const [auto, setAuto] = useState<"idle" | "running" | "paused">("idle");
  const [activeDecision, setActiveDecision] = useState("Timeline");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const toggleCat = (c: string) =>
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        {/* Real width (272px) inside a framed viewport so the rail reads at
            product scale; the surrounding box stands in for page chrome. */}
        <div className="flex h-[520px] overflow-hidden border border-border">
          <aside className="flex w-[272px] shrink-0 flex-col border-r border-border-subtle bg-background">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-base font-medium text-foreground">Checklist</h2>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 pb-3">
              {SIDEBAR_CATEGORY_ORDER.map((category) => {
                const items = SIDEBAR_DECISIONS.filter((d) => d.category === category);
                if (items.length === 0) return null;
                const open = !collapsedCats.has(category);
                return (
                  <div key={category} className="mb-1.5">
                    <button
                      type="button"
                      onClick={() => toggleCat(category)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-1 px-2 pt-3 pb-1 font-medium text-label text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90")} />
                      {category}
                    </button>
                    {open &&
                      items.map((d) => {
                        const isActive = d.label === activeDecision;
                        return (
                          <button
                            key={d.label}
                            type="button"
                            onClick={() => setActiveDecision(d.label)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:text-foreground",
                              isActive
                                ? "bg-accent font-medium text-foreground"
                                : d.state === "inprogress"
                                  ? "font-medium text-foreground"
                                  : d.state === "notstarted"
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            )}
                          >
                            <span aria-hidden className="grid size-4 shrink-0 place-items-center">
                              {d.state === "complete" && (
                                <Check className="size-3 text-muted-foreground" strokeWidth={2.5} />
                              )}
                            </span>
                            <span className="flex-1 truncate">{d.label}</span>
                            <SidebarDecisionTag state={d.state} active={isActive} />
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </nav>
            <div className="p-3">
              {auto === "running" ? (
                <Button variant="cta" size="sm" className="w-full" icon={<Pause className="size-4" />} onClick={() => setAuto("paused")}>
                  In progress
                </Button>
              ) : auto === "paused" ? (
                <Button variant="cta" size="sm" className="w-full" icon={<Play className="size-4" />} onClick={() => setAuto("running")}>
                  Paused
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setAuto("running")}>
                  Auto-complete
                </Button>
              )}
            </div>
          </aside>
          <div className="grid flex-1 place-items-center bg-background">
            <span className="font-medium text-xs text-muted-foreground">
              {activeDecision}
            </span>
          </div>
        </div>
        <a
          href="/playground/checklist-sidebar"
          className="mt-3 inline-block font-medium text-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open full page ↗
        </a>
      </Panel>

      <Panel title="Built from">
        <div className="flex flex-wrap gap-2">
          {["collapsible groups", "state tag", "review = brand", "active = accent fill", "auto-complete footer"].map((p) => (
            <span
              key={p}
              className="border border-border bg-card px-2.5 py-1 font-medium text-label text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const DEMO_DOCS = [
  { slug: "overview", title: "Overview" },
  { slug: "getting-started", title: "Getting started" },
  {
    title: "Guides",
    children: [
      { slug: "account-setup", title: "Account setup" },
      { slug: "notifications", title: "Notifications" },
      { slug: "sharing", title: "Sharing" },
      { slug: "integrations", title: "Integrations" },
    ],
  },
  { slug: "billing", title: "Billing" },
  { slug: "privacy", title: "Privacy" },
  { slug: "faq", title: "FAQ" },
  { slug: "roadmap", title: "Roadmap" },
  { slug: "changelog", title: "Changelog" },
];

const DEMO_ACTIVE = "account-setup";

// One doc short of the limit (10 docs): stays open, no hover. Sits beside the
// 11-doc list so the playground shows both sides of the threshold.
const DEMO_DOCS_10 = DEMO_DOCS.slice(0, -1);

const DEMO_TOC: TocItem[] = [
  { id: "overview", text: "Overview", level: 2 },
  { id: "who-its-for", text: "Who it's for", level: 2 },
  { id: "how-it-works", text: "How it works", level: 2 },
  { id: "getting-started", text: "Getting started", level: 2 },
  { id: "faq", text: "FAQ", level: 2 },
];

function BuiltFrom({ parts }: { parts: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((p) => (
        <span
          key={p}
          className="border border-border bg-card px-2.5 py-1 font-medium text-label text-muted-foreground"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function DocListStory() {
  const [active, setActive] = useState(DEMO_ACTIVE);
  const [active10, setActive10] = useState("getting-started");
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        {/* onSelect drives active locally so clicks change selection without navigating. */}
        <Canvas>
          <div className="flex flex-wrap items-start gap-10">
            {/* Fixed height reserves the expanded size so hover doesn't shift. */}
            <div className="h-[490px] w-[240px]">
              <p className="mb-2 font-medium text-label text-muted-foreground">
                11 docs · hover to expand
              </p>
              <DocList docs={DEMO_DOCS} activeSlug={active} onSelect={setActive} />
            </div>
            <div className="w-[240px]">
              <p className="mb-2 font-medium text-label text-muted-foreground">
                10 docs · stays open
              </p>
              <DocList docs={DEMO_DOCS_10} activeSlug={active10} onSelect={setActive10} />
            </div>
          </div>
        </Canvas>
      </Panel>

      <Panel title="Built from">
        <BuiltFrom parts={["collapses past 10 docs", "collapsible groups", "active = foreground + bar"]} />
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`import { DocList } from "@/components/ds/doc-list";\n\n<DocList docs={docs} activeSlug={slug} />`}
        />
      </Panel>
    </div>
  );
}

function DocsNavStory() {
  const [active, setActive] = useState(DEMO_ACTIVE);
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        {/* onSelect drives active locally so clicks change selection without navigating. */}
        <Canvas>
          {/* Fixed height reserves the expanded size so hover doesn't shift. */}
          <div className="h-[660px] w-[280px]">
            <DocsNav
              docs={DEMO_DOCS}
              activeSlug={active}
              toc={DEMO_TOC}
              onSelect={setActive}
            />
          </div>
        </Canvas>
        <p className="mt-3 max-w-[420px] text-[13px] leading-snug text-muted-foreground">
          Doc list collapses to the active doc and expands on hover once there
          are more than 10 docs; at 10 or fewer it stays open (no hover). The TOC below stays put
          — the expanded list floats over it.
        </p>
      </Panel>

      <Panel title="Built from">
        <BuiltFrom parts={["Doc list", "Table of contents"]} />
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`import { DocsNav } from "@/components/ds/docs-nav";\n\n<DocsNav docs={docs} activeSlug={slug} toc={toc} />`}
        />
      </Panel>
    </div>
  );
}

function TableOfContentsStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="w-[240px]">
            <TableOfContents toc={DEMO_TOC} />
          </div>
        </Canvas>
      </Panel>

      <Panel title="Built from">
        <BuiltFrom parts={["anchor links", "IntersectionObserver scrollspy", "auto-scan (ids headings)"]} />
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`import { TableOfContents } from "@/components/ds/table-of-contents";\n\n// zero-config: scans the page <article>, ids its headings, scrollspies\n<TableOfContents />\n\n// controlled: pass a server-extracted list\n<TableOfContents toc={toc} />`}
        />
      </Panel>
    </div>
  );
}

/* ── shell ────────────────────────────────────────────────────────────── */

const ALL_IDS = [...STORIES, ...COMPOSED].map((s) => s.id) as string[];

function PlaygroundInner() {
  // Story is persisted in the `?story=` query param. It's known server-side, so
  // the first paint already renders the right story — no restore flicker.
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("story");
  const [active, setActive] = useState<StoryId>(
    fromUrl && ALL_IDS.includes(fromUrl) ? (fromUrl as StoryId) : "button"
  );
  const dark = useTheme();
  const [query, setQuery] = useState("");

  // PanelChat state lives here (not in PanelChatStory) so the docked panel
  // can render as a flex sibling of the scroll region — aside rail on the
  // left, main scroll in the middle, docked chat on the right. Story-level
  // state can't do that: PanelChatStory is buried inside the max-w-[800px]
  // content column.
  const chat = usePanelChatDemo();
  const ordered = [...STORIES, ...COMPOSED];
  const current = ordered.find((s) => s.id === active)!;
  const composed = COMPOSED.some((s) => s.id === active);
  const activeIndex = ordered.findIndex((s) => s.id === active);
  const prevStory = ordered[activeIndex - 1];
  const nextStory = ordered[activeIndex + 1];

  // Filter the rail by name + blurb. Empty query shows everything.
  const q = query.trim().toLowerCase();
  const match = (s: { name: string; blurb: string }) =>
    !q || s.name.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q);
  const groups = [
    { heading: "Primitives", items: STORIES.filter(match) },
    { heading: "Composed", items: COMPOSED.filter(match) },
  ];
  const noResults = groups.every((g) => g.items.length === 0);

  const select = (id: StoryId) => {
    setActive(id);
    window.history.replaceState(null, "", `?story=${id}`);
  };

  return (
    <div
      className={`${dark ? "ds dark" : "ds"} flex h-screen overflow-hidden`}
      style={{ "--ds-nav-h": "calc(3rem + 1px)" } as React.CSSProperties}
    >
      {/* App column: nav + rail + main. Docked PanelChat lives as its
          own sibling to the right of this column (see below) so it can
          span the full viewport height instead of starting below the nav. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <SiteNav />
      <ComponentPalette
        groups={[
          { heading: "Primitives", items: STORIES },
          { heading: "Composed", items: COMPOSED },
        ]}
        active={active}
        onSelect={(id) => select(id as StoryId)}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Story rail */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border-subtle bg-card">
        <div className="shrink-0 px-6 py-6">
          <SearchField
            value={query}
            onValueChange={setQuery}
            placeholder="Search components…"
          />
          <p className="mt-2 px-1 font-medium text-label text-muted-foreground">
            <kbd className="font-mono">⌘K</kbd> to jump anywhere
          </p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
          {noResults && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No components match “{query}”.
            </p>
          )}
          {groups.map((group) =>
            group.items.length === 0 ? null : (
            <div key={group.heading} className="flex flex-col">
              <p className="px-3 py-2 font-medium text-label text-muted-foreground">
                {group.heading}
              </p>
              {group.items.map((s) => {
                const on = s.id === active;
                return (
                  <button
                    key={s.id}
                    onClick={() => select(s.id)}
                    className={`flex flex-col gap-0.5 px-3 py-2.5 text-left transition-colors ${
                      on
                        ? "bg-muted text-foreground dark:bg-accent dark:text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-accent/60 dark:hover:text-accent-foreground"
                    }`}
                  >
                    <span className="text-sm text-foreground">{s.name}</span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {s.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Canvas */}
      {/* Flex row: scrollable story content on the left, docked PanelChat
          (when active + docked) as an inline flex sibling on the right.
          Story content is `min-w-0` so it can actually shrink as the panel
          grows — otherwise the max-w-[800px] column would refuse to give
          way. */}
      <main className="ds-no-scrollbar flex min-h-0 flex-1 overflow-y-auto bg-background">
        <section className="min-w-0 flex-1">
        <div className="mx-auto max-w-[800px] px-12 py-14">
          <div className="mb-10">
            <Label>{composed ? "Composed" : "Primitive"}</Label>
            <h2 className="mt-1 text-[32px] font-medium leading-tight">
              {current.name}
            </h2>
            <p className="mt-2 max-w-[520px] text-base font-light text-muted-foreground">
              {current.blurb}
            </p>
            {STORY_REGISTRY[active]?.length ? (
              <div className="mt-5 flex flex-col gap-2">
                {STORY_REGISTRY[active]!.map((name) => (
                  <InstallCommand key={name} name={name} />
                ))}
              </div>
            ) : null}
          </div>

          {active === "banner" && <BannerStory />}
          {active === "accordion" && <AccordionStory />}
          {active === "alert" && <AlertStory />}
          {active === "alertdialog" && <AlertDialogStory />}
          {active === "badge" && <BadgeStory />}
          {active === "card" && <CardStory />}
          {active === "checkbox" && <CheckboxStory />}
          {active === "kbd" && <KbdStory />}
          {active === "label" && <LabelStory />}
          {active === "pagination" && <PaginationStory />}
          {active === "popover" && <PopoverStory />}
          {active === "progress" && <ProgressStory />}
          {active === "radiogroup" && <RadioGroupStory />}
          {active === "scrollarea" && <ScrollAreaStory />}
          {active === "sheet" && <SheetStory />}
          {active === "skeleton" && <SkeletonStory />}
          {active === "slider" && <SliderStory />}
          {active === "toggle" && <ToggleStory />}
          {active === "button" && <ButtonStory />}
          {active === "input" && <InputStory />}
          {active === "tabs" && <TabsStory />}
          {active === "separator" && <SeparatorStory />}
          {active === "breadcrumb" && <BreadcrumbStory />}
          {active === "tooltip" && <TooltipStory />}
          {active === "toast" && <ToastStory />}
          {active === "avatar" && <AvatarStory />}
          {active === "dropdown" && <DropdownStory />}
          {active === "field" && <FieldStory />}
          {active === "textarea" && <TextareaStory />}
          {active === "select" && <SelectStory />}
          {active === "dialog" && <DialogStory />}
          {active === "spinner" && <SpinnerStory />}
          {active === "switch" && <SwitchStory />}
          {active === "table" && <TableStory />}
          {active === "buttongroup" && <ButtonGroupStory />}
          {active === "inputgroup" && <InputGroupStory />}
          {active === "command" && <CommandStory />}
          {active === "search" && <SearchStory />}
          {active === "topnav" && (
            <NavStory dark={dark} onToggleTheme={toggleTheme} />
          )}
          {active === "sidebar" && <SidebarStory />}
          {active === "doclist" && <DocListStory />}
          {active === "docsnav" && <DocsNavStory />}
          {active === "toc" && <TableOfContentsStory />}
          {active === "messagescroller" && <MessageScrollerStory />}
          {active === "chat" && <ChatStory />}
          {active === "panelchat" && <PanelChatStory chat={chat} />}
          {active === "multiplechoice" && <MultipleChoiceStory />}
          {active === "codeblock" && <CodeBlockStory />}
          {active === "mermaid" && <MermaidStory />}
          {active === "htmlpreview" && <HtmlPreviewStory />}

          {/* Prev / next — walk the rail order (Primitives then Composed). */}
          <nav className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6">
            {prevStory ? (
              <button
                onClick={() => select(prevStory.id)}
                className="group flex flex-col items-start gap-1 text-left"
              >
                <span className="font-medium text-label text-muted-foreground">
                  ← Previous
                </span>
                <span className="text-sm text-foreground group-hover:underline">
                  {prevStory.name}
                </span>
              </button>
            ) : (
              <span />
            )}
            {nextStory ? (
              <button
                onClick={() => select(nextStory.id)}
                className="group flex flex-col items-end gap-1 text-right"
              >
                <span className="font-medium text-label text-muted-foreground">
                  Next →
                </span>
                <span className="text-sm text-foreground group-hover:underline">
                  {nextStory.name}
                </span>
              </button>
            ) : (
              <span />
            )}
          </nav>
        </div>
        </section>
      </main>
      </div>
      </div>
      {/* Docked PanelChat mounts here — sibling of the whole app column so
          the sidebar spans the FULL viewport height (nav row included),
          instead of starting below the top nav. Minimal + expanded
          presentations are still `position: fixed` inside the component,
          so they render into a zero-width flex slot without claiming
          layout space. */}
      {active === "panelchat" && (
        <PanelChat
          messages={chat.messages}
          isStreaming={chat.isStreaming}
          onSend={chat.send}
          onNewChat={chat.reset}
          placeholder="Ask me anything"
          starterPrompts={[
            "Summarize this document",
            "What are the open questions?",
            "Draft a follow-up for the team",
          ]}
          presentation={chat.presentation}
          onPresentationChange={chat.setPresentation}
        />
      )}
    </div>
  );
}

/* ── Primitives pulled in with the AI Elements chat ──────────────────────
   Radix-portaled content (dialog, select, command, hover-card) escapes the
   page's `.ds` scope, so its content root re-declares `ds` to keep
   the brand tokens. */

function TextareaStory() {
  const [notes, setNotes] = useState(FIELD_INITIAL.notes);
  const over = notes.length - NOTES_LIMIT;
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="grid w-full max-w-[420px] gap-4">
            <Textarea placeholder="Write a message…" />
            <Textarea placeholder="Disabled" disabled />
            <Textarea
              label="Notes"
              error={over > 0 ? `${over} characters over the limit` : undefined}
              meta={<Label>{notes.length}/{NOTES_LIMIT}</Label>}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Textarea placeholder="Write a message…" />\n\n// Built-in error handling:\n<Textarea label="Notes" error={errors.notes} meta={count} />`} />
      </Panel>
      <ErrorsPanel
        example={`// API response
<Textarea label="Notes" error={serverErrors.notes?.message} meta={count} … />

// client validation
<Textarea label="Notes" error={notes.length > 200 ? "Over the 200-character limit" : undefined} … />`}
      />
    </div>
  );
}

function SpinnerStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="flex items-center gap-8 text-foreground">
            <Spinner />
            <Spinner className="size-6" />
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Spinner />\n<Spinner className="size-6" />`} />
      </Panel>
    </div>
  );
}

function SwitchStory() {
  const [on, setOn] = useState(true);
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Switch checked={on} onCheckedChange={setOn} aria-label="Toggle" />
        </Canvas>
      </Panel>
      <Panel title="States">
        <div className="flex flex-col">
          <Row label="off"><Switch checked={false} onCheckedChange={() => {}} /></Row>
          <Row label="on"><Switch checked onCheckedChange={() => {}} /></Row>
          <Row label="disabled"><Switch disabled /></Row>
          <Row label="disabled on"><Switch disabled defaultChecked /></Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Switch checked={on} onCheckedChange={setOn} />`} />
      </Panel>
    </div>
  );
}

const TABLE_ROWS = [
  { plan: "Starter", seats: "1", storage: "5 GB", price: "$0" },
  { plan: "Plus", seats: "5", storage: "100 GB", price: "$12" },
  { plan: "Pro", seats: "Unlimited", storage: "1 TB", price: "$29" },
];

// Status cell for a comparison matrix (good / caution / bad), icon + text.
type Verdict = "good" | "warn" | "bad";
function Cell({ v, children }: { v: Verdict; children: React.ReactNode }) {
  const Icon = v === "good" ? Check : v === "warn" ? AlertTriangle : X;
  const color =
    v === "good"
      ? "text-success-text"
      : v === "warn"
        ? "text-warning-text"
        : "text-destructive-text";
  return (
    <div className="flex gap-2">
      <Icon className={`mt-0.5 size-3.5 shrink-0 ${color}`} />
      <span>{children}</span>
    </div>
  );
}

const ARCH_ROWS: {
  dim: string;
  all: [Verdict, string];
  phased: [Verdict, string];
  beta: [Verdict, string];
}[] = [
  {
    dim: "Time to launch",
    all: ["good", "Fastest, one date"],
    phased: ["warn", "Spread over a few weeks"],
    beta: ["warn", "Slower, beta comes first"],
  },
  {
    dim: "Risk",
    all: ["bad", "Everything ships at once"],
    phased: ["good", "Small, contained steps"],
    beta: ["good", "Issues found early"],
  },
  {
    dim: "Feedback",
    all: ["bad", "Only after launch"],
    phased: ["good", "After each step"],
    beta: ["good", "Before launch"],
  },
  {
    dim: "Effort",
    all: ["good", "One push"],
    phased: ["warn", "Several releases"],
    beta: ["warn", "Extra beta setup"],
  },
  {
    dim: "Team fit",
    all: ["warn", "Needs everyone at once"],
    phased: ["good", "Steady pace"],
    beta: ["good", "Small team to start"],
  },
];

function TableStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="border border-border bg-background p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right font-mono tabular-nums">Seats</TableHead>
                <TableHead className="text-right font-mono tabular-nums">Storage</TableHead>
                <TableHead className="text-right font-mono tabular-nums">Price / mo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TABLE_ROWS.map((r) => (
                <TableRow key={r.plan}>
                  <TableCell className="font-medium">{r.plan}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{r.seats}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{r.storage}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{r.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Panel title="In long-form content">
        <div className="resize-x overflow-auto border border-border bg-background px-8 py-7 min-w-[340px] max-w-full">
          <div className="mx-auto max-w-[760px] text-body leading-relaxed text-foreground">
            <p>
              <strong className="font-medium">Timeline</strong>{" "}is still open in
              the sidebar, so let&apos;s settle the bigger question first:{" "}
              <strong className="font-medium">how to launch</strong>.
            </p>
            <p className="mt-4">
              It shapes everything after it. Given your constraints (a small
              team, about six weeks, and a fixed announcement date) here is how
              I see the options:
            </p>

            <div className="my-6">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[22%] whitespace-normal">Dimension</TableHead>
                    <TableHead className="w-[26%] whitespace-normal">All at once</TableHead>
                    <TableHead className="w-[26%] whitespace-normal">Phased rollout</TableHead>
                    <TableHead className="w-[26%] whitespace-normal">Beta first</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ARCH_ROWS.map((r) => (
                    <TableRow key={r.dim} className="align-top">
                      <TableCell className="font-medium">{r.dim}</TableCell>
                      <TableCell><Cell v={r.all[0]}>{r.all[1]}</Cell></TableCell>
                      <TableCell><Cell v={r.phased[0]}>{r.phased[1]}</Cell></TableCell>
                      <TableCell><Cell v={r.beta[0]}>{r.beta[1]}</Cell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="mt-6">
              My recommendation:{" "}
              <strong className="font-medium">a phased rollout</strong>, with a
              short beta for the riskiest part. This gives you:
            </p>
            <ul className="mt-3 flex flex-col gap-2 pl-5 [list-style:disc] marker:text-muted-foreground">
              <li>
                <strong className="font-medium">A safe first step</strong>, the core
                experience ships first, so the announcement date holds.
              </li>
              <li>
                <strong className="font-medium">Early feedback</strong>, each step
                tells you what to fix before the next one.
              </li>
              <li>
                <strong className="font-medium">A steady pace</strong>, a small team
                can carry it without a crunch at the end.
              </li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Anatomy">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">TableHead</span> — medium-weight muted label on a single rule (border).</p>
          <p><span className="text-foreground">TableRow</span> — hairline rows (border-subtle), quiet muted hover.</p>
          <p><span className="text-foreground">Numeric columns</span> — add <span className="font-mono text-xs">text-right font-mono tabular-nums</span> so figures align on the decimal.</p>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Plan</TableHead>\n      <TableHead className="text-right font-mono tabular-nums">Price / mo</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell className="font-medium">Plus</TableCell>\n      <TableCell className="text-right font-mono tabular-nums">$12</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>`}
        />
      </Panel>
    </div>
  );
}

function SelectStory() {
  // Radix portals the content out of the page's `.ds dark` scope, so
  // re-declare the theme (incl. dark) on the portaled root.
  const dark = useTheme();
  const themeClass = dark ? "ds dark" : "ds";
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Select>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Reminder frequency" />
            </SelectTrigger>
            <SelectContent className={themeClass}>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger label="Category" error="Pick a category" fieldClassName="w-[320px]" className="w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent className={themeClass}>
              {["General", "Design", "Content", "Operations"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<Select>\n  <SelectTrigger><SelectValue placeholder="…" /></SelectTrigger>\n  <SelectContent>\n    <SelectItem value="weekly">Weekly</SelectItem>\n  </SelectContent>\n</Select>\n\n// Built-in error handling — on the trigger:\n<SelectTrigger label="Category" error={errors.category}>…</SelectTrigger>`}
        />
      </Panel>
      <ErrorsPanel
        example={`// API response
<SelectTrigger label="Category" error={serverErrors.category?.message}>…</SelectTrigger>

// client validation
<SelectTrigger label="Category" error={!category ? "Pick a category" : undefined}>…</SelectTrigger>`}
      />
    </div>
  );
}

function DialogStory() {
  // Radix portals the content out of the page's `.ds dark` scope, so
  // re-declare the theme (incl. dark) on the portaled root.
  const dark = useTheme();
  const themeClass = dark ? "ds dark" : "ds";
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Lock decision</Button>
            </DialogTrigger>
            <DialogContent className={themeClass}>
              <DialogHeader>
                <DialogTitle>Lock this decision?</DialogTitle>
                <DialogDescription>
                  Locking marks Timeline as done.
                  You can reopen it later if something changes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button size="sm">Lock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<Dialog>\n  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>\n  <DialogContent>\n    <DialogHeader><DialogTitle>…</DialogTitle></DialogHeader>\n    <DialogFooter>…</DialogFooter>\n  </DialogContent>\n</Dialog>`}
        />
      </Panel>
    </div>
  );
}

function ButtonGroupStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <ButtonGroup>
            <Button variant="secondary" size="sm">
              Day
            </Button>
            <Button variant="secondary" size="sm">
              Week
            </Button>
            <Button variant="secondary" size="sm">
              Month
            </Button>
          </ButtonGroup>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<ButtonGroup>\n  <Button variant="secondary">Day</Button>\n  <Button variant="secondary">Week</Button>\n</ButtonGroup>`}
        />
      </Panel>
    </div>
  );
}

function InputGroupStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <InputGroup className="w-full max-w-[360px]">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search decisions…" />
          </InputGroup>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<InputGroup>\n  <InputGroupAddon><Search /></InputGroupAddon>\n  <InputGroupInput placeholder="Search…" />\n</InputGroup>`}
        />
      </Panel>
    </div>
  );
}

function CommandStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Command className="w-full max-w-[360px] border border-border">
            <CommandInput placeholder="Jump to a decision…" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Decisions">
                <CommandItem>Timeline</CommandItem>
                <CommandItem>Budget</CommandItem>
                <CommandItem>Risks</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`<Command>\n  <CommandInput placeholder="Search…" />\n  <CommandList>\n    <CommandGroup heading="Decisions">\n      <CommandItem>…</CommandItem>\n    </CommandGroup>\n  </CommandList>\n</Command>`}
        />
      </Panel>
    </div>
  );
}

function SearchStory() {
  const [q, setQ] = useState("");
  const pool = [
    "Goals",
    "Audience",
    "Timeline",
    "Budget",
    "Risks",
  ];
  const hits = pool.filter((d) => d.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="w-full max-w-[360px]">
            <SearchField
              label="Search decisions"
              value={q}
              onValueChange={setQ}
              placeholder="Search decisions…"
            />
            <ul className="mt-3 flex flex-col">
              {hits.length === 0 ? (
                <li className="py-2 text-sm text-muted-foreground">No matches.</li>
              ) : (
                hits.map((d) => (
                  <li
                    key={d}
                    className="border-t border-border py-2 text-sm text-foreground first:border-t-0"
                  >
                    {d}
                  </li>
                ))
              )}
            </ul>
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet
          code={`const [q, setQ] = useState("");\n\n<Search value={q} onValueChange={setQ} placeholder="Search…" />\n\n// filter your list from q\nitems.filter((i) => i.toLowerCase().includes(q.toLowerCase()))\n\n// Built-in error handling — a failed search, with an inline Retry.\n// (No results is an empty state, not an error.)\n<Search label="Search projects" value={q} onValueChange={setQ}\n  error={failed ? "Couldn't search — connection lost." : undefined}\n  errorAction={<FieldErrorAction onClick={retry}>Retry</FieldErrorAction>} />`}
        />
      </Panel>
      <ErrorsPanel
        example={`// e.g. a React Query / fetch error
<Search label="Search projects" error={query.error?.message} … />

// No results is NOT an error — render an empty state instead.`}
      />
    </div>
  );
}

/* ── Chat (AI Elements) ──────────────────────────────────────────────────
   Conversation + streaming Message + PromptInput composed as the project
   chat. Local mock only — no /api/chat here; submitting echoes a canned
   reply so the composer, message rendering, and auto-scroll can be exercised. */
type DemoMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  thinking?: boolean;
};

/** Canned assistant replies, picked at random so repeated sends vary. */
const MOCK_REPLIES = [
  "For a project this size, **two weeks** is a realistic first phase. Keep a few days of buffer for feedback before you lock a launch date.",
  "I'd lean toward **a smaller first release**: ship the core experience, then add the extras once you've seen how people use it.",
  "Good question. Three things matter here: scope, people, and deadlines. Want me to draft a plan for each and add it to the proposal?",
  "Noted. I'll factor that into the timeline — it moves the dates for the review step specifically.",
];

const CHAT_SEED: DemoMsg[] = [
  {
    id: "s1",
    role: "assistant",
    text: "Now on **Timeline**. I'll ask a few questions, then draft a plan for you to review.",
  },
  {
    id: "s2",
    role: "user",
    text: "How long should the first phase take?",
  },
  {
    id: "s3",
    role: "assistant",
    text: "For a project this size, **two weeks** is a realistic first phase. Add a few days of buffer for feedback before you commit to a launch date.",
  },
];

const CODE_TS = `export async function getRecentItems(userId: string) {
  const items = await db.items.where({ ownerId: userId });
  const recent = items.filter((item) => !item.archived).slice(0, 10);
  await events.publish("items.viewed", { userId, count: recent.length });
  return recent;
}`;

function CodeBlockStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="border border-border bg-background p-6">
          <CodeBlock code={CODE_TS} language="ts" showLineNumbers>
            <CodeBlockHeader>
              <CodeBlockTitle>
                <Code className="size-3.5 text-cta" />
                <CodeBlockFilename>recent-items.ts</CodeBlockFilename>
              </CodeBlockTitle>
              <CodeBlockActions>
                <CopyButton value={CODE_TS} size="icon-xs" aria-label="Copy code" />
              </CodeBlockActions>
            </CodeBlockHeader>
          </CodeBlock>
        </div>
      </Panel>

      <Panel title="Without line numbers">
        <div className="border border-border bg-background p-6">
          <CodeBlock code={`npx shadcn add https://design-system.example.com/r/table.json`} language="bash">
            <CodeBlockHeader>
              <CodeBlockTitle>
                <Code className="size-3.5 text-cta" />
                <CodeBlockFilename>bash</CodeBlockFilename>
              </CodeBlockTitle>
              <CodeBlockActions>
                <CopyButton
                  value="npx shadcn add https://design-system.example.com/r/table.json"
                  size="icon-xs"
                  aria-label="Copy command"
                />
              </CodeBlockActions>
            </CodeBlockHeader>
          </CodeBlock>
        </div>
      </Panel>

      <Panel title="Anatomy">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Header</span> — muted surface bar: code glyph + filename/lang (mono), copy button on the right.</p>
          <p><span className="text-foreground">Body</span> — shiki tokens (github light/dark), Geist Mono, optional line-number gutter.</p>
          <p>Skinning to DS tokens still in progress — surface, header weight, syntax theme.</p>
        </div>
      </Panel>
    </div>
  );
}

const MERMAID_FLOW = `flowchart LR
  A[Draft] --> B[Review]
  B --> C{Approved?}
  C -->|yes| D[Publish]
  C -->|no| E[Revise]
  class D term`;

const MERMAID_SEQ = `sequenceDiagram
  participant U as User
  participant API
  participant Worker
  U->>API: save changes
  API->>Worker: process update
  Worker-->>API: update complete
  API-->>U: 200 OK`;

function MermaidFrame({ title, chart }: { title: string; chart: string }) {
  return (
    <CodeBlockContainer language="mermaid">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <Workflow className="size-3.5 text-cta" />
          <CodeBlockFilename>{title}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CopyButton value={chart} size="icon-xs" aria-label="Copy diagram" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <div className="p-6">
        <Mermaid chart={chart} />
      </div>
    </CodeBlockContainer>
  );
}


function MermaidStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Flowchart">
        <div className="border border-border bg-background p-6">
          <MermaidFrame title="review-flow" chart={MERMAID_FLOW} />
        </div>
      </Panel>

      <Panel title="Sequence">
        <div className="border border-border bg-background p-6">
          <MermaidFrame title="save-sequence" chart={MERMAID_SEQ} />
        </div>
      </Panel>

      <Panel title="Anatomy">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Chrome</span> — same shell as the code block: muted header with a glyph + label, copy on the right.</p>
          <p><span className="text-foreground">Theme</span> — read from the live DS tokens, so nodes/edges track light and dark. Flat fills, foreground edges, mono labels.</p>
          <p>Tag a node with <span className="font-mono text-xs">class &lt;id&gt; term</span> for the brand terminal treatment.</p>
        </div>
      </Panel>
    </div>
  );
}

/* ── HTML preview (AI Elements) ───────────────────────────────────────────
   Self-contained mockup markup, using the injected brand tokens. In chat this
   is the body of a ```mockup fence; the renderer wraps it in a themed iframe. */
const MOCKUP_HTML = `<div style="min-height:100%;display:flex;flex-direction:column;background:var(--background)">
  <!-- top bar -->
  <header style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle);padding:12px 20px">
    <div style="display:flex;align-items:center;gap:14px">
      <span style="width:22px;height:22px;background:var(--foreground);border-radius:8px;display:inline-block"></span>
      <span style="font-size:12px;font-weight:500;color:var(--muted-foreground)">Projects</span>
    </div>
    <div style="display:flex;gap:8px">
      <button style="background:transparent;color:var(--foreground);border:1px solid var(--input);border-radius:8px;padding:6px 12px;font-size:13px">Export</button>
      <button style="background:var(--cta);color:var(--cta-foreground);border:0;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:500">New project</button>
    </div>
  </header>

  <main style="flex:1;padding:24px 20px">
    <p style="font-size:12px;font-weight:500;color:var(--muted-foreground);margin:0 0 6px">Workspace · This week</p>
    <h1 style="font-size:26px;font-weight:500;margin:0 0 20px">Recent activity</h1>

    <!-- stat row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
      <div style="background:var(--card);border:1px solid var(--border-subtle);border-radius:8px;padding:16px">
        <p style="font-size:13px;color:var(--muted-foreground);margin:0 0 6px">Open</p>
        <p style="font-size:28px;font-weight:500;margin:0">12</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border-subtle);border-radius:8px;padding:16px">
        <p style="font-size:13px;color:var(--muted-foreground);margin:0 0 6px">In review</p>
        <p style="font-size:28px;font-weight:500;margin:0">5</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border-subtle);border-radius:8px;padding:16px">
        <p style="font-size:13px;color:var(--muted-foreground);margin:0 0 6px">Completed</p>
        <p style="font-size:28px;font-weight:500;margin:0">18</p>
      </div>
    </div>

    <!-- list -->
    <div style="border:1px solid var(--border-subtle);border-radius:8px;overflow:hidden">
      <div style="display:grid;grid-template-columns:80px 1fr 120px 96px;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border-subtle);font-size:12px;font-weight:500;color:var(--muted-foreground)">
        <span>ID</span><span>Item</span><span>Updated</span><span></span>
      </div>
      <div style="display:grid;grid-template-columns:80px 1fr 120px 96px;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-subtle);align-items:center;font-size:14px">
        <span style="color:var(--muted-foreground)">#4821</span><span>Homepage refresh</span><span>2h ago</span>
        <button style="background:var(--cta);color:var(--cta-foreground);border:0;border-radius:8px;padding:6px 0;font-size:13px;font-weight:500">Approve</button>
      </div>
      <div style="display:grid;grid-template-columns:80px 1fr 120px 96px;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-subtle);align-items:center;font-size:14px">
        <span style="color:var(--muted-foreground)">#4822</span><span>Welcome email</span><span>5h ago</span>
        <button style="background:var(--cta);color:var(--cta-foreground);border:0;border-radius:8px;padding:6px 0;font-size:13px;font-weight:500">Approve</button>
      </div>
      <div style="display:grid;grid-template-columns:80px 1fr 120px 96px;gap:12px;padding:14px 16px;align-items:center;font-size:14px">
        <span style="color:var(--muted-foreground)">#4823</span><span>Spring announcement</span><span>1d ago</span>
        <button style="background:transparent;color:var(--foreground);border:1px solid var(--input);border-radius:8px;padding:6px 0;font-size:13px">Review</button>
      </div>
    </div>
  </main>
</div>`;

const MOCKUP_MD = `Here's a first pass at the projects screen:

\`\`\`mockup height=640 title="Projects · recent activity"
${MOCKUP_HTML}
\`\`\`

Want the stat row to collapse into a single strip on mobile?`;

function HtmlPreviewStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview — direct render">
        <div className="border border-border bg-background p-6">
          <HtmlPreview
            code={MOCKUP_HTML}
            isIncomplete={false}
            language="mockup"
            meta='height=640 title="Projects · recent activity"'
          />
        </div>
      </Panel>

      <Panel title="Streaming — fence not closed yet">
        <div className="border border-border bg-background p-6">
          <HtmlPreview
            code={MOCKUP_HTML}
            isIncomplete
            language="mockup"
            meta='height=640 title="Projects · recent activity"'
          />
        </div>
      </Panel>

      <Panel title="In chat — a ```mockup fence in an assistant message">
        <TooltipProvider>
          <div className="border border-border bg-background p-6">
            <Message from="assistant">
              <MessageContent>
                <MessageResponse>{MOCKUP_MD}</MessageResponse>
              </MessageContent>
            </Message>
          </div>
        </TooltipProvider>
      </Panel>

      <Panel title="Anatomy">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Renderer</span> — a Streamdown <span className="font-mono text-xs">renderers</span> entry maps the <span className="font-mono text-xs">mockup</span> fence language to this component (same slot as <span className="font-mono text-xs">mermaid</span>).</p>
          <p><span className="text-foreground">Isolation</span> — <span className="font-mono text-xs">iframe sandbox=&quot;&quot;</span>: opaque origin, no scripts, no same-origin. Fonts/images still load.</p>
          <p><span className="text-foreground">Brand</span> — DS tokens + the two faces injected into the doc, so mockups read on-brand via <span className="font-mono text-xs">var(--foreground)</span>, <span className="font-mono text-xs">var(--cta)</span>, …</p>
          <p><span className="text-foreground">Meta</span> — <span className="font-mono text-xs">height=&lt;px&gt;</span> and <span className="font-mono text-xs">title=&quot;…&quot;</span> on the fence; the frame is user-resizable.</p>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`// wire the renderer once, alongside the other Streamdown plugins\nconst plugins = {\n  code, mermaid,\n  renderers: [{ language: "mockup", component: HtmlPreview }],\n};\n\n// then the assistant emits:\n// \`\`\`mockup height=240 title="Reservation approval"\n// <div>…self-contained HTML + CSS…</div>\n// \`\`\``}
        />
      </Panel>
    </div>
  );
}

/* ── Chat primitives ─────────────────────────────────────────────────────
   MessageScroller (the smart transcript container) pairs with ai-elements
   Message rows. The Chat story below shows the composed surface. */

/** Canned rows so the scroller has something to actually scroll. */
const SCROLLER_ROWS = [
  { id: "r1", from: "assistant", text: "Now on Timeline. I'll ask a few questions, then draft a plan." },
  { id: "r2", from: "user", text: "How long should the first phase take?" },
  { id: "r3", from: "assistant", text: "For a project this size, two weeks is a realistic first phase." },
  { id: "r4", from: "user", text: "And the whole project?" },
  { id: "r5", from: "assistant", text: "About six weeks end to end: two to plan, three to build, one to test and launch." },
  { id: "r6", from: "user", text: "What about the review step specifically?" },
  { id: "r7", from: "assistant", text: "Give it its own few days, and name one person who signs off, so feedback doesn't stall the launch." },
  { id: "r8", from: "user", text: "What if we fall behind?" },
  { id: "r9", from: "assistant", text: "Cut scope before moving the date: keep the core experience, move the extras to a follow-up release, and tell everyone affected early." },
  { id: "r10", from: "assistant", text: "Want me to fold these dates into the plan?" },
] as const;

function MessageScrollerStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="border border-border bg-background p-4">
          <div className="h-[320px]">
            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="gap-4 px-2 py-3">
                    {SCROLLER_ROWS.map((row) => (
                      <MessageScrollerItem key={row.id} messageId={row.id}>
                        <Message from={row.from}>
                          <MessageContent>{row.text}</MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>
        </div>
      </Panel>

      <Panel title="Behaviour">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Follows the live edge only while the reader is at it.</span> Scroll up mid-answer and the follow drops — a streaming answer never fights a reader re-reading the question.</p>
          <p><span className="text-foreground">Anchors a new turn near the viewport top</span> with the previous turn still peeking, instead of shoving it off-screen.</p>
          <p><span className="text-foreground">Preserves the visible row when older messages prepend.</span> History paging does not move what the reader is looking at.</p>
          <p><span className="text-foreground">A jump-to-latest button</span> fades in only when the reader has let go of the edge (scroll up in the preview to see it).</p>
        </div>
      </Panel>

      <Panel title="Anatomy">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">MessageScrollerProvider</span> — owns the scroll state; anything below that needs <code>scrollToMessage</code> (a history list, a table of contents) can reach it.</p>
          <p><span className="text-foreground">MessageScroller / Viewport / Content</span> — the scroll shell. Viewport carries the bottom fade + scrollbar utilities.</p>
          <p><span className="text-foreground">MessageScrollerItem</span> — one row. <code>messageId</code> must be stable for the life of the row (see <Link className="underline" href="/design-system/docs/chat">chat doc</Link>).</p>
          <p><span className="text-foreground">MessageScrollerButton</span> — the jump-to-latest chip; positions itself.</p>
        </div>
      </Panel>

      <Panel title="Code">
        <Snippet
          code={`import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

<MessageScrollerProvider autoScroll defaultScrollPosition="end">
  <MessageScroller>
    <MessageScrollerViewport>
      <MessageScrollerContent>
        {rows.map((r) => (
          <MessageScrollerItem key={r.id} messageId={r.id}>
            {/* one Message per row */}
          </MessageScrollerItem>
        ))}
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>`}
        />
      </Panel>
    </div>
  );
}

function ChatStory() {
  const [msgs, setMsgs] = useState<DemoMsg[]>(CHAT_SEED);
  const [status, setStatus] = useState<"ready" | "thinking" | "streaming">(
    "ready"
  );

  const send = (text: string) => {
    const t = text.trim();
    if (!t || status !== "ready") return;
    const aiId = crypto.randomUUID();
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];

    // 1) drop the user message + a "thinking" placeholder (shimmer).
    setMsgs((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: t },
      { id: aiId, role: "assistant", text: "", thinking: true },
    ]);
    setStatus("thinking");

    // 2) after a fake 2s think, stream the reply word by word.
    setTimeout(() => {
      setMsgs((m) =>
        m.map((msg) => (msg.id === aiId ? { ...msg, thinking: false } : msg))
      );
      setStatus("streaming");
      const words = reply.split(" ");
      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        setMsgs((m) =>
          m.map((msg) =>
            msg.id === aiId
              ? { ...msg, text: words.slice(0, i).join(" ") }
              : msg
          )
        );
        if (i >= words.length) {
          clearInterval(iv);
          setStatus("ready");
        }
      }, 55);
    }, 2000);
  };

  // PromptInputSubmit speaks ChatStatus: map the think phase to "submitted".
  const submitStatus = status === "thinking" ? "submitted" : status;

  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <TooltipProvider>
          <div className="flex h-[520px] flex-col border border-border bg-background">
            <Conversation className="flex-1">
              <ConversationContent className="mx-auto w-full max-w-[680px] gap-6 px-5 py-6">
                {msgs.map((m) => (
                  <Message key={m.id} from={m.role}>
                    <MessageContent>
                      {m.role === "assistant" ? (
                        m.thinking ? (
                          <p className="text-shimmer w-fit font-medium">
                            Thinking…
                          </p>
                        ) : (
                          <MessageResponse>{m.text}</MessageResponse>
                        )
                      ) : (
                        <p className="leading-relaxed">{m.text}</p>
                      )}
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="px-4 pb-4">
              <div className="mx-auto max-w-[680px]">
                <PromptInput onSubmit={(msg) => send(msg.text)} className="bg-white dark:bg-popover">
                  <PromptInputBody>
                    <PromptInputTextarea placeholder="Write a message…" className="min-h-11" />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <PromptInputTools>
                      <PromptInputButton>
                        <Plus />
                      </PromptInputButton>
                      <PromptInputButton>
                        <Paperclip />
                      </PromptInputButton>
                    </PromptInputTools>
                    <PromptInputSubmit status={submitStatus} variant="cta" />
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </Panel>

      <Panel title="Pieces">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Conversation</span> — scroll container + stick-to-bottom + jump button.</p>
          <p><span className="text-foreground">Message / MessageResponse</span> — role-aligned bubble; assistant text renders streamed markdown.</p>
          <p><span className="text-foreground">PromptInput</span> — auto-growing composer with tools + submit (flips to a stop state while streaming).</p>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`<Conversation>\n  <ConversationContent>\n    <Message from="assistant">\n      <MessageContent>\n        <MessageResponse>{text}</MessageResponse>\n      </MessageContent>\n    </Message>\n  </ConversationContent>\n  <ConversationScrollButton />\n</Conversation>\n\n<PromptInput onSubmit={(m) => sendMessage({ text: m.text })}>\n  <PromptInputBody><PromptInputTextarea /></PromptInputBody>\n  <PromptInputFooter>\n    <PromptInputTools>\n      <PromptInputButton><Plus /></PromptInputButton>\n      <PromptInputButton><Paperclip /></PromptInputButton>\n    </PromptInputTools>\n    <PromptInputSubmit status={status} variant="cta" />\n  </PromptInputFooter>\n</PromptInput>`}
        />
      </Panel>
    </div>
  );
}

/* ── Multiple choice (AI Elements) ───────────────────────────────────────
   The assistant's in-chat question card. Shown in its three states: a live
   card wired to a mock chat log, an awaiting card, and a prebaked answered
   card. */
function MultipleChoiceStory() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="grid gap-10">
      <Panel title="Live — records the answer into a mock chat">
        <Canvas>
          <div className="w-full max-w-[742px]">
            <MultipleChoice
              label="Question 2 / 4"
              question="How long should the first phase take?"
              options={[
                "1 week",
                "2 weeks",
                "1 month",
                "Not sure yet",
              ]}
              awaiting
              onSubmit={(a) => setLog((l) => [...l, `answered → ${a}`])}
              onAskChat={() => setLog((l) => [...l, "ask chat →"])}
            />
            {log.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1">
                {log.map((a, i) => (
                  <li
                    key={i}
                    className="font-medium text-label text-muted-foreground"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Canvas>
      </Panel>

      <Panel title="States">
        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label>awaiting</Label>
            <MultipleChoice
              label="Question 3 / 4"
              question="Which flows are revenue-critical enough to justify a stricter target?"
              options={[
                "Reservation approval",
                "Content consumption",
                "Reporting exports",
                "Admin settings",
              ]}
              awaiting
            />
          </div>
          <div className="grid gap-1.5">
            <Label>answered</Label>
            <MultipleChoice
              label="Question 1 / 4"
              question="How long should the first phase take?"
              options={[
                "1 week",
                "2 weeks",
                "1 month",
                "Not sure yet",
              ]}
              answer="2 weeks"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Pieces">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p><span className="text-foreground">Option ledger</span> — checkbox leads each row; multi-select, selection reads in foreground.</p>
          <p><span className="text-foreground">Typed answer</span> — free-form Input slots a custom answer alongside the presets.</p>
          <p><span className="text-foreground">States</span> — <span className="font-mono text-xs">awaiting</span> (open, selectable), answered (collapses to the chosen option(s), read-only).</p>
          <p><span className="text-foreground">Actions</span> — answered card offers <span className="font-mono text-xs">Ask chat</span> (follow-up) and <span className="font-mono text-xs">Edit</span> (re-open to re-select).</p>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`<MultipleChoice\n  label="Question 2 / 4"\n  question="How long should the first phase take?"\n  options={["1 week", "2 weeks", "1 month", "Not sure yet"]}\n  awaiting\n  onSubmit={(answer) => sendMessage({ text: answer })}\n  onAskChat={() => focusComposer()}\n/>\n\n// read-only, prebaked answer — collapses to the chosen option, Edit re-opens it\n<MultipleChoice question="…" options={[…]} answer="2 weeks" />`}
        />
      </Panel>
    </div>
  );
}

/* ── PanelChat story ────────────────────────────────────────────────────
   State + mount are hoisted to PlaygroundInner so the docked panel can
   render as a flex sibling of the story scroll region (aside rail on the
   left, main scroll in the middle, docked chat on the right). This story
   only paints the controls and description; the live PanelChat is mounted
   at the layout level.
*/

type PanelChatPresentation = "minimal" | "expanded" | "docked";

interface PanelChatDemo {
  messages: PanelChatMessage[];
  isStreaming: boolean;
  presentation: PanelChatPresentation;
  setPresentation: (p: PanelChatPresentation) => void;
  send: (text: string) => void;
  reset: () => void;
}

function usePanelChatDemo(): PanelChatDemo {
  const [messages, setMessages] = useState<PanelChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [presentation, setPresentation] =
    useState<PanelChatPresentation>("minimal");

  const send = (text: string) => {
    const ts = Date.now();
    const pendingId = `pending-${ts}`;
    setMessages((prev) => [
      ...prev,
      { id: pendingId, timestamp: ts, question: text, answer: "", pending: true },
    ]);
    setIsStreaming(true);
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                id: `qa-${ts}`,
                pending: false,
                answer:
                  "This is a canned reply. In-product, an answer would stream in as markdown here — code blocks, mermaid diagrams and tables all lay out edge-to-edge because the assistant turn has no bubble.",
              }
            : m,
        ),
      );
      setIsStreaming(false);
    }, 1600);
  };

  const reset = () => {
    setMessages([]);
    setIsStreaming(false);
    setPresentation("minimal");
  };

  return { messages, isStreaming, presentation, setPresentation, send, reset };
}

function PanelChatStory({ chat }: { chat: PanelChatDemo }) {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <div className="flex flex-col gap-4 border border-border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            The composer mounts live at the layout level as a flex sibling of
            this scroll region — same shape as the platform. Use the controls
            below to switch presentations or reset the demo transcript.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <ControlSelect
              label="presentation"
              value={chat.presentation}
              options={["minimal", "expanded", "docked"] as const}
              onChange={chat.setPresentation}
            />
            <Button variant="secondary" size="sm" onClick={chat.reset}>
              Reset transcript
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Presentations">
        <div className="grid gap-4 border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground sm:grid-cols-3">
          <div>
            <div className="mb-1 font-medium text-label text-foreground">
              minimal
            </div>
            The &quot;Ask me anything&quot; pill, floating at the bottom of the
            viewport. The only visible surface until the reader engages.
          </div>
          <div>
            <div className="mb-1 font-medium text-label text-foreground">
              expanded
            </div>
            The pill grew a transcript above it and a toolbar above that.
            Still centred, still floating — deliberately not modal.
          </div>
          <div>
            <div className="mb-1 font-medium text-label text-foreground">
              docked
            </div>
            The card as a resizable right sidebar. Renders inline as a flex
            sibling of the page content, so shrinking the panel widens the
            page.
          </div>
        </div>
      </Panel>

      <Panel title="Usage">
        <Snippet
          code={`import { PanelChat, type PanelChatMessage } from "@/components/ds/panel-chat";

const [messages, setMessages] = useState<PanelChatMessage[]>([]);
const [isStreaming, setIsStreaming] = useState(false);

<PanelChat
  messages={messages}
  isStreaming={isStreaming}
  onSend={(text) => { /* enqueue user + stream reply */ }}
  onNewChat={() => setMessages([])}
  starterPrompts={["Summarize this document", "What are the open questions?"]}
/>`}
        />
      </Panel>
    </div>
  );
}

export default function Playground() {
  return (
    <Suspense fallback={null}>
      <PlaygroundInner />
    </Suspense>
  );
}

/* ── Additional shadcn primitives ───────────────────────────────────────── */

function AccordionStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Accordion type="single" collapsible defaultValue="a" className="w-full max-w-[480px]">
            <AccordionItem value="a">
              <AccordionTrigger>What&apos;s included in the free plan?</AccordionTrigger>
              <AccordionContent>One workspace, up to 3 projects, and 5 GB of storage.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Can I change plans later?</AccordionTrigger>
              <AccordionContent>Yes — upgrade or downgrade any time. Changes apply on your next billing date.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>How do I invite someone?</AccordionTrigger>
              <AccordionContent>Open the project, choose Share, and enter their email address.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Accordion type="single" collapsible>\n  <AccordionItem value="a">\n    <AccordionTrigger>Question</AccordionTrigger>\n    <AccordionContent>Answer</AccordionContent>\n  </AccordionItem>\n</Accordion>`} />
      </Panel>
    </div>
  );
}

function AlertStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Variants">
        <div className="grid max-w-[560px] gap-3">
          <Alert>
            <Info />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>Your changes are saved automatically.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 />
            <AlertTitle>Project published</AlertTitle>
            <AlertDescription>Anyone with the link can now view it.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle />
            <AlertTitle>Storage almost full</AlertTitle>
            <AlertDescription>You&apos;ve used 4.6 GB of 5 GB.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t save changes</AlertTitle>
            <AlertDescription>Check your connection and try again.</AlertDescription>
          </Alert>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Alert variant="warning">  // default | success | warning | destructive\n  <AlertTriangle />\n  <AlertTitle>Title</AlertTitle>\n  <AlertDescription>Details</AlertDescription>\n</Alert>`} />
      </Panel>
    </div>
  );
}

function AlertDialogStory() {
  // Portaled like Dialog — re-declare the theme scope on the content.
  const dark = useTheme();
  const themeClass = dark ? "ds dark" : "ds";
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete project</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={themeClass}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the project and its files. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`// Use for confirmations that need an explicit answer.\n// Unlike Dialog, it can't be dismissed by clicking outside.\n<AlertDialog>\n  <AlertDialogTrigger asChild><Button>…</Button></AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>…</AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction>Continue</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`} />
      </Panel>
    </div>
  );
}

function BadgeStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Variants">
        <Canvas>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="brand">New</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Failed</Badge>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Badge variant="success">Active</Badge>\n// default | secondary | outline | brand | success | warning | destructive | ghost | link`} />
      </Panel>
    </div>
  );
}

function CardStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Card className="w-full max-w-[380px]">
            <CardHeader>
              <CardTitle>Website redesign</CardTitle>
              <CardDescription>Updated 2 hours ago</CardDescription>
              <CardAction>
                <Badge variant="success">Active</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              New homepage, onboarding flow, and help center. 12 of 18 tasks done.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Open</Button>
              <Button size="sm" variant="outline">Share</Button>
            </CardFooter>
          </Card>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Card>\n  <CardHeader>\n    <CardTitle>Title</CardTitle>\n    <CardDescription>Subtitle</CardDescription>\n    <CardAction>…</CardAction>\n  </CardHeader>\n  <CardContent>…</CardContent>\n  <CardFooter>…</CardFooter>\n</Card>`} />
      </Panel>
    </div>
  );
}

function CheckboxStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="cb-1" defaultChecked />
              <UiLabel htmlFor="cb-1">Email me about updates</UiLabel>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-2" />
              <UiLabel htmlFor="cb-2">Send a weekly summary</UiLabel>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-3" disabled />
              <UiLabel htmlFor="cb-3">Unavailable option</UiLabel>
            </div>
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Checkbox id="updates" />\n<Label htmlFor="updates">Email me about updates</Label>`} />
      </Panel>
    </div>
  );
}

function KbdStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            Search <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            Save <KbdGroup><Kbd>Ctrl</Kbd><Kbd>S</Kbd></KbdGroup>
          </span>
          <Kbd>Esc</Kbd>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<KbdGroup>\n  <Kbd>⌘</Kbd>\n  <Kbd>K</Kbd>\n</KbdGroup>`} />
      </Panel>
    </div>
  );
}

function LabelStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="grid w-full max-w-[320px] gap-2">
            <UiLabel htmlFor="lbl-name">Display name</UiLabel>
            <Input id="lbl-name" placeholder="Alex Morgan" />
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`// Standalone label. Input/Textarea/Select also take a built-in \`label\` prop (see Field).\n<Label htmlFor="name">Display name</Label>\n<Input id="name" />`} />
      </Panel>
    </div>
  );
}

function PaginationStory() {
  const [page, setPage] = useState(2);
  const go = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setPage(Math.min(Math.max(p, 1), 5));
  };
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={go(page - 1)} />
              </PaginationItem>
              {[1, 2, 3].map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={page === p} onClick={go(p)}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={go(page + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>\n    <PaginationItem><PaginationLink href="?page=2" isActive>2</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationNext href="?page=3" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`} />
      </Panel>
    </div>
  );
}

function PopoverStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Edit name</Button>
            </PopoverTrigger>
            <PopoverContent className="grid gap-3">
              <PopoverHeader>
                <PopoverTitle>Project name</PopoverTitle>
                <PopoverDescription>Shown to everyone with access.</PopoverDescription>
              </PopoverHeader>
              <Input defaultValue="Website redesign" />
              <Button size="sm" className="justify-self-end">Save</Button>
            </PopoverContent>
          </Popover>
        </Canvas>
      </Panel>
      <Panel title="Behaviour">
        <div className="flex flex-col">
          <Row label="surface">Rendered inline (no portal) on the raised popover surface, like DropdownMenu</Row>
          <Row label="motion">Scales out of its trigger — shared menu keyframes, fade-only under reduced motion</Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Popover>\n  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>\n  <PopoverContent>…</PopoverContent>\n</Popover>`} />
      </Panel>
    </div>
  );
}

function ProgressStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="grid w-full max-w-[360px] gap-5">
            {[12, 64, 100].map((v) => (
              <div key={v} className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading files</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{v}%</span>
                </div>
                <Progress value={v} aria-label="Upload progress" />
              </div>
            ))}
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Progress value={64} aria-label="Upload progress" />`} />
      </Panel>
    </div>
  );
}

function RadioGroupStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <RadioGroup defaultValue="weekly">
            {[
              ["daily", "Daily"],
              ["weekly", "Weekly"],
              ["never", "Never"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`rg-${value}`} />
                <UiLabel htmlFor={`rg-${value}`}>{label}</UiLabel>
              </div>
            ))}
          </RadioGroup>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<RadioGroup defaultValue="weekly">\n  <RadioGroupItem value="weekly" id="weekly" />\n  <Label htmlFor="weekly">Weekly</Label>\n</RadioGroup>`} />
      </Panel>
    </div>
  );
}

function ScrollAreaStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <ScrollArea className="h-56 w-64 rounded-lg border border-border">
            <div className="p-4">
              <p className="mb-3 text-sm font-medium">Recent files</p>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="border-t border-border-subtle py-2 text-sm first-of-type:border-t-0">
                  File {String(i + 1).padStart(2, "0")}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<ScrollArea className="h-56 rounded-lg border">\n  …long content…\n</ScrollArea>`} />
      </Panel>
    </div>
  );
}

function SheetStory() {
  // Portaled like Dialog — re-declare the theme scope on the content.
  const dark = useTheme();
  const themeClass = dark ? "ds dark" : "ds";
  const sides = ["right", "left", "top", "bottom"] as const;
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          {sides.map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline" className="capitalize">{side}</Button>
              </SheetTrigger>
              <SheetContent side={side} className={themeClass}>
                <SheetHeader>
                  <SheetTitle>Project settings</SheetTitle>
                  <SheetDescription>Changes apply to everyone in this project.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 px-4">
                  <Input label="Name" defaultValue="Website redesign" />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button>Save</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </Canvas>
      </Panel>
      <Panel title="Behaviour">
        <div className="flex flex-col">
          <Row label="motion">Slides from its edge on the modal durations (220ms in / 160ms out); fade-only under reduced motion</Row>
          <Row label="scrim">Same fading overlay as Dialog</Row>
        </div>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Sheet>\n  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>\n  <SheetContent side="right">  // right | left | top | bottom\n    <SheetHeader><SheetTitle>…</SheetTitle></SheetHeader>\n  </SheetContent>\n</Sheet>`} />
      </Panel>
    </div>
  );
}

function SkeletonStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="flex w-full max-w-[360px] items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Skeleton className="h-4 w-48" />\n// pulses only when motion is allowed`} />
      </Panel>
    </div>
  );
}

function SliderStory() {
  const [v, setV] = useState([40]);
  return (
    <div className="grid gap-10">
      <Panel title="Preview">
        <Canvas>
          <div className="grid w-full max-w-[360px] gap-3">
            <div className="flex justify-between text-sm">
              <span>Volume</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{v[0]}</span>
            </div>
            <Slider value={v} onValueChange={setV} max={100} step={1} aria-label="Volume" className="mb-4" />
            <Slider defaultValue={[20, 80]} max={100} step={1} aria-label="Price range" />
          </div>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Slider defaultValue={[40]} max={100} step={1} />\n<Slider defaultValue={[20, 80]} />  // range`} />
      </Panel>
    </div>
  );
}

function ToggleStory() {
  return (
    <div className="grid gap-10">
      <Panel title="Toggle">
        <Canvas>
          <Toggle aria-label="Bold"><Bold /></Toggle>
          <Toggle variant="outline" aria-label="Italic"><Italic /></Toggle>
          <Toggle variant="outline" defaultPressed>
            <Star /> Favorite
          </Toggle>
        </Canvas>
      </Panel>
      <Panel title="Toggle group">
        <Canvas>
          <ToggleGroup type="single" defaultValue="center" variant="outline" aria-label="Text alignment">
            <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="multiple" aria-label="Formatting">
            <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
          </ToggleGroup>
        </Canvas>
      </Panel>
      <Panel title="Usage">
        <Snippet code={`<Toggle aria-label="Bold"><Bold /></Toggle>\n\n<ToggleGroup type="single" variant="outline">\n  <ToggleGroupItem value="left">…</ToggleGroupItem>\n</ToggleGroup>`} />
      </Panel>
    </div>
  );
}
