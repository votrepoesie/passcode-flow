"use client";

/**
 * PanelChat — DS's platform composer, one component, three presentations.
 *
 *   minimal   → "Ask me anything" pill, fixed to the bottom-centre of the viewport
 *   expanded  → same pill grew a transcript above it and a toolbar above that
 *   docked    → the transcript + composer as a resizable right-hand sidebar,
 *               rendered as an INLINE flex sibling of the page content (not fixed)
 *               so the neighbouring column can shrink as the panel grows
 *
 * Docked contract for consumers: wrap page content and <PanelChat> in a flex
 * row. The content column must be `min-w-0` so it can actually give way when
 * the reader drags the panel wider, and the row itself must clip its overflow
 * (`overflow: hidden`, as an app shell normally does) — the docking animation
 * lets the panel overhang its own right edge for a beat on the way in.
 *
 * Switching presentation crossfades: the surface being left stays mounted for
 * the length of its exit (`usePresentationSwap`) so the two can pass each
 * other. See `app/panel-chat.css` for the choreography and
 * `app/design-system/docs/chat.md` for the component's docs.
 */

import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HistoryIcon,
  Maximize2Icon,
  Minimize2Icon,
  PanelRightIcon,
  Paperclip,
  Plus,
  PlusCircleIcon,
  XIcon,
} from "lucide-react";

import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ds/search";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";

import { LogoMark, LogoSweep } from "./logo-sweep";
import type { PanelChatMessage } from "./types";

/* ── Presentation ──────────────────────────────────────────────────────── */

export type PanelChatPresentation = "minimal" | "expanded" | "docked";

/* ── Presentation swap ─────────────────────────────────────────────────────
 * The three presentations are three DOM trees, so switching one for another
 * unmounts the surface being left and nothing survives to animate out. This
 * keeps the outgoing presentation mounted for exactly the length of its exit
 * so the two can cross — the floating card recedes while the docked panel
 * arrives — instead of one blinking into the other.
 *
 * Exit windows mirror the keyframes in `app/panel-chat.css`. Change one and
 * change the other: too short and the leaving surface is cut off mid-fade,
 * too long and it lingers (invisible, but mounted) over the page.
 */
const EXIT_MS: Record<PanelChatPresentation, number> = {
  minimal: 120, /*  --ds-duration-exit       */
  expanded: 160, /* --ds-duration-modal-exit */
  docked: 160, /*   --ds-duration-modal-exit */
};

function usePresentationSwap(presentation: PanelChatPresentation): {
  /** Surface still on screen playing its exit, or null. */
  leaving: PanelChatPresentation | null;
  /**
   * Surface the last swap came from. Unlike `leaving` it outlives the exit,
   * so the arriving surface keeps knowing how it arrived — dropping that
   * mid-entrance would restyle it and restart its animation.
   */
  from: PanelChatPresentation | null;
  /**
   * False until the first swap. A first mount is not a state change, so the
   * pill has nothing to narrate and shouldn't animate itself in on page load.
   */
  swapped: boolean;
} {
  const [swap, setSwap] = useState<{
    shown: PanelChatPresentation;
    leaving: PanelChatPresentation | null;
    from: PanelChatPresentation | null;
    swapped: boolean;
  }>({ shown: presentation, leaving: null, from: null, swapped: false });

  if (swap.shown !== presentation) {
    // Derived during render, not in an effect. An effect commits after paint,
    // which would show the arriving surface for one frame at its animation's
    // END state before snapping back to the start — a flash on every swap.
    // React throws this pass away and re-renders with the new value before
    // committing, so what we return below is always in step with the prop.
    setSwap({
      shown: presentation,
      leaving: swap.shown,
      from: swap.shown,
      swapped: true,
    });
  }

  const { leaving } = swap;
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(
      () => setSwap((s) => (s.leaving ? { ...s, leaving: null } : s)),
      EXIT_MS[leaving],
    );
    // Re-toggling mid-exit re-runs this with the new leaving surface, so only
    // ever one ghost is on screen — the interrupted one is dropped, not held.
    return () => window.clearTimeout(timer);
  }, [leaving, presentation]);

  return { leaving, from: swap.from, swapped: swap.swapped };
}

/* ── Pill ↔ card morph ─────────────────────────────────────────────────────
 * The pill and the card share a bottom edge and a centre line (the dock's
 * grid pins both), so the card can grow straight out of the pill: it starts
 * clipped to the pill's rectangle and opens to its full box — and closes
 * back down into it. The insets are `calc(%)` against the card's own box, so
 * they keep tracking it while it is still easing out of the enlarged size.
 *
 * WAAPI rather than keyframes: the pill's size is only known by measuring,
 * and an interrupted morph must retarget from the clip it is showing now.
 *
 * The open end sits 40px OUTSIDE the card (radius 16 + 40, so the arc stays
 * concentric with the card's corners) — an `inset(0)` end would clip the
 * card's lift shadow for the whole morph and pop it in on the last frame.
 */
const MORPH_OPEN = "inset(-40px round 56px)";

function morphClosed(pill: DOMRect) {
  const side = `calc(50% - ${pill.width / 2}px)`;
  return `inset(calc(100% - ${pill.height}px) ${side} 0 ${side} round 16px)`;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ── Docked drag limits ────────────────────────────────────────────────── */

const DOCK_MIN = 320;
const DOCK_MAX = 760;
// Soft floor for the page's content column. Panel drag won't grow past what
// leaves this much room for the neighbour. If the parent row is too narrow to
// satisfy both (DOCK_MIN + MIN_MAIN_CONTENT), DOCK_MIN wins so the panel stays
// draggable at all.
const MIN_MAIN_CONTENT = 480;

/* ── Turn identity (stable ids for MessageScrollerItem) ─────────────────
 * The scroller keys measuring / anchoring / scroll-to on `messageId`, so an
 * id has to hold still for the life of a row. `PanelChatMessage.id` may not
 * be stable (a live "streaming" id can become a real id on the done frame),
 * so we mint one from `timestamp` and resolve ms-collisions in array order.
 */
function turnIdsFor(messages: PanelChatMessage[]): string[] {
  const seen = new Map<string, number>();
  return messages.map((m) => {
    const base = `t${m.timestamp}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  });
}

function useTurnIds(messages: PanelChatMessage[]): string[] {
  return useMemo(() => turnIdsFor(messages), [messages]);
}

/* ── Scope wrapper ─────────────────────────────────────────────────────── */

/**
 * Owns the `.ds-panel-chat` CSS scope. `display: contents` on the class
 * means this element contributes no box — inherited custom properties and
 * descendant selectors still resolve, so the docked <aside> becomes a direct
 * flex child of the host row.
 */
const ChatScope: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="ds-panel-chat">{children}</div>
);

/* ── Input ─────────────────────────────────────────────────────────────── */

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Blur + close on Escape. */
  onDismiss: () => void;
  /** Reopens the transcript when the minimal field takes focus. */
  onFocus?: () => void;
  isStreaming: boolean;
  isConnected: boolean;
  placeholder: string;
  connectingPlaceholder: string;
}

/**
 * One textarea, two homes — the minimal pill and the expanded/docked
 * composer. Enter sends; Shift+Enter newline; Escape closes.
 */
const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSubmit,
      onDismiss,
      onFocus,
      isStreaming,
      isConnected,
      placeholder,
      connectingPlaceholder,
    },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          } else if (e.key === "Escape") {
            e.currentTarget.blur();
            onDismiss();
          }
        }}
        placeholder={!isConnected ? connectingPlaceholder : placeholder}
        disabled={!isConnected}
        aria-label="Ask a question"
        aria-busy={isStreaming || undefined}
        className="pc-input-field"
      />
    );
  },
);

/* ── Send button (LogoMark at rest, LogoSweep while streaming) ─────────── */

interface ChatSendButtonProps {
  onSend: () => void;
  hasDraft: boolean;
  isStreaming: boolean;
  isConnected: boolean;
}

/**
 * Send + waiting in one control. `aria-disabled` while streaming lets AT
 * hear the truth without dimming the animation — the one thing on-screen
 * saying the app is alive while a stream is in flight.
 */
const ChatSendButton: React.FC<ChatSendButtonProps> = ({
  onSend,
  hasDraft,
  isStreaming,
  isConnected,
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    onClick={onSend}
    disabled={!isConnected || (!isStreaming && !hasDraft)}
    aria-disabled={isStreaming || undefined}
    title={isStreaming ? "Waiting for a reply" : "Send"}
    aria-label={isStreaming ? "Waiting for a reply" : "Send message"}
    className="pc-send"
  >
    {isStreaming ? (
      <LogoSweep className="size-[18px]" />
    ) : (
      <LogoMark className="size-[18px]" />
    )}
  </Button>
);

/* ── Turn (one exchange: question pill + answer, no bubble) ─────────────── */

interface ChatTurnProps {
  message: PanelChatMessage;
  waitingText: string;
}

const ChatTurn: React.FC<ChatTurnProps> = ({ message, waitingText }) => {
  const hasAnswer =
    message.answer !== undefined &&
    message.answer !== null &&
    message.answer !== "";
  return (
    <div className="pc-turn">
      {message.question.trim() !== "" && (
        <Message from="user">
          <MessageContent>
            <span className="pc-q">{message.question}</span>
          </MessageContent>
        </Message>
      )}
      {(hasAnswer || message.pending) && (
        <Message from="assistant">
          <MessageContent className="pc-a">
            {hasAnswer ? (
              message.answer
            ) : (
              <span className="pc-thinking">{waitingText}</span>
            )}
          </MessageContent>
        </Message>
      )}
    </div>
  );
};

/* ── Transcript ────────────────────────────────────────────────────────── */

interface ChatTranscriptProps {
  messages: PanelChatMessage[];
  starterPrompts?: string[];
  onSend: (message: string) => void;
  isConnected: boolean;
  error?: string | null;
  waitingText: string;
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  messages,
  starterPrompts,
  onSend,
  isConnected,
  error,
  waitingText,
}) => {
  const turnIds = useTurnIds(messages);
  const showStarters = messages.length === 0 && !!starterPrompts?.length;

  return (
    <MessageScroller className="min-h-0 flex-1">
      <MessageScrollerViewport className="pc-scroll" preserveScrollOnPrepend>
        {/* pb clears the viewport bottom fade so the last row doesn't
            dissolve into the composer. */}
        <MessageScrollerContent className="gap-5 pb-14">
          {showStarters ? (
            <div className="pc-starters">
              {starterPrompts!.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSend(prompt)}
                  disabled={!isConnected}
                  className="pc-starter"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageScrollerItem key={turnIds[i]} messageId={turnIds[i]}>
                <ChatTurn message={m} waitingText={waitingText} />
              </MessageScrollerItem>
            ))
          )}
          {error && (
            <MessageScrollerItem messageId="error">
              <p className="pc-error">{error}</p>
            </MessageScrollerItem>
          )}
        </MessageScrollerContent>
      </MessageScrollerViewport>
    </MessageScroller>
  );
};

/* ── PanelChat ─────────────────────────────────────────────────────────── */

export interface PanelChatProps {
  messages: PanelChatMessage[];
  isStreaming: boolean;
  error?: string | null;
  onSend: (message: string) => void;
  /** Supersedes the session and empties the transcript. Omit to hide the button. */
  onNewChat?: () => void;
  placeholder?: string;
  starterPrompts?: string[];
  /** Slot beside the composer — the Chat/Agent switch on copilot surfaces. */
  modeToggle?: React.ReactNode;
  /** Slot above the composer — the copilot's pending-change review chip. */
  banner?: React.ReactNode;
  /** Overrides the toolbar's history button with the host's own modal. */
  onHistory?: () => void;
  isConnected?: boolean;
  connectingPlaceholder?: string;
  waitingText?: string;
  /** Which presentation to open in (uncontrolled). */
  defaultPresentation?: PanelChatPresentation;
  /** Controlled presentation. Pair with `onPresentationChange`. */
  presentation?: PanelChatPresentation;
  onPresentationChange?: (presentation: PanelChatPresentation) => void;
}

export const PanelChat: React.FC<PanelChatProps> = ({
  messages,
  isStreaming,
  error,
  onSend,
  onNewChat,
  placeholder = "Ask me anything",
  starterPrompts,
  modeToggle,
  banner,
  onHistory,
  isConnected = true,
  connectingPlaceholder = "Connecting…",
  waitingText = "Thinking…",
  defaultPresentation = "minimal",
  presentation: controlledPresentation,
  onPresentationChange,
}) => {
  const [uncontrolled, setUncontrolled] =
    useState<PanelChatPresentation>(defaultPresentation);
  const isControlled = controlledPresentation !== undefined;
  const presentation = isControlled ? controlledPresentation : uncontrolled;
  const setPresentation = (next: PanelChatPresentation) => {
    if (!isControlled) setUncontrolled(next);
    onPresentationChange?.(next);
  };

  const { leaving, from, swapped } = usePresentationSwap(presentation);

  // A pill ↔ card swap morphs; every other swap keeps its keyframes. Reduced
  // motion keeps the plain crossfade (see panel-chat.css).
  const floatingPair = new Set([from, presentation]);
  const morphing =
    floatingPair.has("minimal") &&
    floatingPair.has("expanded") &&
    !prefersReducedMotion();

  useLayoutEffect(() => {
    if (!morphing) return;
    const pill = pillEl.current;
    const card = cardEl.current;
    if (!pill || !card) return;
    const opening = presentation === "expanded";
    const closed = morphClosed(pill.getBoundingClientRect());
    // Mid-morph reversal: start from the clip on screen, not from an end.
    const from = morphAnim.current
      ? getComputedStyle(card).clipPath
      : opening
        ? closed
        : MORPH_OPEN;
    morphAnim.current?.cancel();
    const tokens = getComputedStyle(card);
    const anim = card.animate(
      opening
        ? [
            { clipPath: from, opacity: 0 },
            { opacity: 1, offset: 0.4 },
            { clipPath: MORPH_OPEN, opacity: 1 },
          ]
        : [
            { clipPath: from, opacity: 1 },
            { opacity: 1, offset: 0.6 },
            { clipPath: closed, opacity: 0 },
          ],
      {
        // Mirrors --ds-duration-modal-enter / EXIT_MS.expanded.
        duration: opening ? 220 : EXIT_MS.expanded,
        // A shape changing in place, not a thing arriving — the in-out curve
        // lets the eye catch the growth that ease-out would spend in 30ms.
        easing:
          tokens.getPropertyValue("--ds-ease-in-out").trim() || "ease-in-out",
        fill: opening ? "none" : "forwards",
      },
    );
    morphAnim.current = anim;
    anim.onfinish = anim.oncancel = () => {
      if (morphAnim.current === anim) morphAnim.current = null;
    };
  }, [morphing, presentation]);

  const [draft, setDraft] = useState("");
  const [dockWidth, setDockWidth] = useState(420);
  // Floating card blown up to 80% of the viewport. Only the expanded
  // presentation reads it; the docked panel has its own resize handle.
  const [enlarged, setEnlarged] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  // The morph's two ends — set on whichever pill / card is mounted, live or
  // leaving (`cardRef` only ever holds the live card).
  const pillEl = useRef<HTMLDivElement>(null);
  const cardEl = useRef<HTMLDivElement>(null);
  const morphAnim = useRef<Animation | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Carrying focus across the minimal → expanded swap.
   *
   * The two presentations are different trees — the field moves down into
   * the composer — so React unmounts it and mounts a fresh one, leaving the
   * caret nowhere. Refocus is imperative, armed only on paths where the
   * reader was already typing (focusing the pill, sending from it).
   * Unconditional refocus would steal the caret when the chat opens itself.
   */
  const refocusOnOpen = useRef(false);
  useEffect(() => {
    if (presentation === "minimal" || !refocusOnOpen.current) return;
    refocusOnOpen.current = false;
    inputRef.current?.focus();
  }, [presentation]);

  /**
   * Open when a stream actually starts — the reply isn't streaming into
   * something invisible. Keyed on the stream STARTING, not the transcript
   * growing (stored history arriving on mount is a 0 → N change that would
   * pop the chat open on every load).
   */
  const wasStreaming = useRef(false);
  useEffect(() => {
    if (isStreaming && !wasStreaming.current && presentation === "minimal") {
      setPresentation("expanded");
    }
    wasStreaming.current = isStreaming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  /**
   * Click-outside collapses the floating expanded card back to the pill.
   * Docked stays open until the reader dismisses it explicitly — the panel
   * is a persistent surface, so a stray click on the page shouldn't kill it.
   *
   * Guarded against popovers that portal OUT of the card's DOM subtree
   * (Radix menus, tooltips, custom dropdowns a consumer passes via
   * `modeToggle` / `banner`). Anything that looks like a floating layer is
   * treated as still-inside-the-chat here, otherwise picking an item from
   * a dropdown would dismiss the whole card.
   */
  useEffect(() => {
    if (presentation !== "expanded") return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (cardRef.current?.contains(target)) return;
      if (target instanceof Element) {
        if (
          target.closest(
            "[data-radix-popper-content-wrapper], [data-radix-portal], [role='menu'], [role='listbox'], [role='dialog'], [role='tooltip']",
          )
        ) {
          return;
        }
      }
      setPresentation("minimal");
    };
    // `mousedown` (not `click`) so the collapse fires before whatever the
    // click was going to do — the reader's next action lands on the page.
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation]);

  // Closing forgets the enlarged size so the next open starts at the default.
  const close = () => {
    setEnlarged(false);
    setPresentation("minimal");
  };
  const toggleDock = () =>
    setPresentation(presentation === "docked" ? "expanded" : "docked");

  const send = (message: string) => {
    if (!message.trim() || isStreaming || !isConnected) return;
    setDraft("");
    if (presentation === "minimal") {
      refocusOnOpen.current = true;
      setPresentation("expanded");
    }
    onSend(message.trim());
  };

  /**
   * Drag-to-resize the docked panel. Width grows as the pointer moves LEFT
   * (measured from the right edge of the flex parent).
   *
   * Move / up listeners live on `window` (not the handle) so a fast drag
   * that overshoots the handle keeps resizing — pointer capture on the
   * handle drops when the browser routes an event elsewhere first.
   *
   * Measures the panel's flex parent (the row that also holds the page
   * content). Using `window.innerWidth` would be wrong when the host puts
   * a rail beside the row — those pixels aren't available for the panel to
   * share with the page.
   */
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const parent = el.closest(".pc-panel")?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    const parentLeft = parentRect?.left ?? 0;
    const parentWidth = parentRect?.width ?? window.innerWidth;
    const onMove = (move: PointerEvent) => {
      // Cap dynamically so the neighbouring content column keeps at least
      // MIN_MAIN_CONTENT px. If that soft floor collides with DOCK_MIN
      // (parent too narrow to satisfy both), DOCK_MIN wins so the panel
      // stays draggable at all.
      const dynamicMax = Math.max(
        DOCK_MIN,
        Math.min(DOCK_MAX, parentWidth - MIN_MAIN_CONTENT),
      );
      const raw = parentLeft + parentWidth - move.clientX;
      const next = Math.min(dynamicMax, Math.max(DOCK_MIN, raw));
      setDockWidth(next);
    };
    const onUp = () => {
      // pointercancel matters as much as pointerup — an interrupted touch
      // would otherwise leave the move listener alive and the panel would
      // keep resizing with nothing held down.
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    // Suppress text selection + swap the OS cursor for the whole page while
    // the drag is live, so hovering over neighbouring text mid-drag doesn't
    // paint an I-beam.
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  /* ── Shared building blocks ─────────────────────────────────────────── */

  const sendButton = (
    <ChatSendButton
      onSend={() => send(draft)}
      hasDraft={draft.trim() !== ""}
      isStreaming={isStreaming}
      isConnected={isConnected}
    />
  );

  /**
   * Built per surface rather than once: `inputRef` is a single ref object, so
   * handing it to both the live pill and a leaving one would let whichever
   * unmounts last null it out — stranding Escape-to-close and the
   * carry-the-caret refocus on a dead node.
   */
  const renderInput = (
    ref: React.RefObject<HTMLTextAreaElement | null> | undefined,
  ) => (
    <ChatInput
      ref={ref}
      value={draft}
      onChange={setDraft}
      onSubmit={() => send(draft)}
      onDismiss={close}
      onFocus={() => {
        // Any focus on the pill (tab or click into the field) opens the
        // chat — expanded is where the reader can actually see what they
        // are typing beside.
        if (presentation === "minimal") {
          refocusOnOpen.current = true;
          setPresentation("expanded");
        }
      }}
      isStreaming={isStreaming}
      isConnected={isConnected}
      placeholder={placeholder}
      connectingPlaceholder={connectingPlaceholder}
    />
  );

  /* ── Surfaces ─────────────────────────────────────────────────────────
   * One presentation's tree. `ghost` marks the surface being LEFT: for the
   * length of its exit it is a picture, not a control, so it takes no
   * `inputRef` (see `renderInput`), is `inert` + `aria-hidden` so two live
   * composers never compete for the caret or get announced twice, and tells
   * ChatBody to stand down from its document-level ⌘K listener.
   *
   * Keys are the presentation name. A surface can never be both live and
   * leaving at once, so the key is unique — and on a swap it lets React reuse
   * the very DOM node that was live a frame ago, which is what makes the
   * exit start from what the reader is already looking at instead of a
   * freshly mounted copy of it.
   */
  const surface = (which: PanelChatPresentation, ghost: boolean) => {
    const motion = ghost ? "exit" : swapped ? "enter" : undefined;

    if (which === "minimal") {
      // Click anywhere on the pill (empty space, textarea, disabled send)
      // opens expanded. onClick catches the mouse path; onFocus catches the
      // keyboard path (tab). Together the pill has one job: get out of the
      // way of the expanded surface.
      const openFromPill = () => {
        refocusOnOpen.current = true;
        setPresentation("expanded");
      };
      return (
        <div
          key="minimal"
          ref={pillEl}
          className="pc-minimal"
          data-motion={motion}
          data-morph={morphing || undefined}
          onClick={ghost ? undefined : openFromPill}
          role={ghost ? undefined : "button"}
          tabIndex={-1}
          inert={ghost}
          aria-hidden={ghost || undefined}
        >
          {renderInput(ghost ? undefined : inputRef)}
          {sendButton}
        </div>
      );
    }

    const body = (
      <ChatBody
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        starterPrompts={starterPrompts}
        onSend={send}
        isConnected={isConnected}
        onNewChat={onNewChat}
        onHistory={onHistory}
        docked={which === "docked"}
        onToggleDock={toggleDock}
        enlarged={enlarged}
        onToggleEnlarged={() => setEnlarged((v) => !v)}
        onClose={close}
        banner={banner}
        modeToggle={modeToggle}
        draft={draft}
        setDraft={setDraft}
        inputRef={ghost ? undefined : inputRef}
        onDismiss={close}
        placeholder={placeholder}
        connectingPlaceholder={connectingPlaceholder}
        waitingText={waitingText}
        ghost={ghost}
      />
    );

    /* ── docked (inline flex sibling, resizable) ──────────────────────── */

    if (which === "docked") {
      return (
        <MessageScrollerProvider
          key="docked"
          autoScroll
          defaultScrollPosition="end"
        >
          <aside
            className="pc-panel"
            data-motion={motion}
            style={{ width: `${dockWidth}px` }}
            aria-label="Chat"
            inert={ghost}
            aria-hidden={ghost || undefined}
          >
            <div
              className="pc-resize"
              onPointerDown={startResize}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat"
            />
            {body}
          </aside>
        </MessageScrollerProvider>
      );
    }

    /* ── expanded (fixed floating card, centred at the bottom) ────────── */

    return (
      <MessageScrollerProvider
        key="expanded"
        autoScroll
        defaultScrollPosition="end"
      >
        <div
          ref={(el) => {
            cardEl.current = el;
            if (!ghost) cardRef.current = el;
          }}
          className="pc-expanded"
          data-motion={motion}
          data-morph={morphing || undefined}
          data-enlarged={enlarged || undefined}
          inert={ghost}
          aria-hidden={ghost || undefined}
        >
          {body}
        </div>
      </MessageScrollerProvider>
    );
  };

  // Leaving surface first so the arriving one paints over it.
  const onScreen: Array<[PanelChatPresentation, boolean]> = leaving
    ? [
        [leaving, true],
        [presentation, false],
      ]
    : [[presentation, false]];

  const floating = onScreen.filter(([which]) => which !== "docked");
  const panels = onScreen.filter(([which]) => which === "docked");

  return (
    <ChatScope>
      {/* One dock for both floating surfaces — it is a single-cell grid, so
          a leaving pill and an arriving card share its bottom-centre anchor
          and cross in place instead of lining up side by side. */}
      {floating.length > 0 && (
        <div className="pc-dock">
          {floating.map(([which, ghost]) => surface(which, ghost))}
        </div>
      )}
      {panels.map(([which, ghost]) => surface(which, ghost))}
    </ChatScope>
  );
};

/* ── Body (toolbar + transcript + composer + history palette) ──────────── */

interface ChatBodyProps {
  messages: PanelChatMessage[];
  isStreaming: boolean;
  error?: string | null;
  starterPrompts?: string[];
  onSend: (message: string) => void;
  isConnected: boolean;
  onNewChat?: () => void;
  onHistory?: () => void;
  docked: boolean;
  onToggleDock: () => void;
  /** Floating card is at 80% of the viewport. */
  enlarged: boolean;
  onToggleEnlarged: () => void;
  onClose: () => void;
  banner?: React.ReactNode;
  modeToggle?: React.ReactNode;
  draft: string;
  setDraft: (value: string) => void;
  /** Omitted on the surface being left — the ref belongs to the live one. */
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onDismiss: () => void;
  placeholder: string;
  connectingPlaceholder: string;
  waitingText: string;
  /** This body is playing its exit: no document-level keyboard listeners. */
  ghost?: boolean;
}

/**
 * Split out because the built-in history list uses `scrollToMessage` from
 * `useMessageScroller`, which must be called BELOW the provider.
 */
const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  isStreaming,
  error,
  starterPrompts,
  onSend,
  isConnected,
  onNewChat,
  onHistory,
  docked,
  onToggleDock,
  enlarged,
  onToggleEnlarged,
  onClose,
  banner,
  modeToggle,
  draft,
  setDraft,
  inputRef,
  onDismiss,
  placeholder,
  connectingPlaceholder,
  waitingText,
  ghost,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  // -1 = no row highlighted. Bumps to 0 on first ArrowDown; also set by hover.
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [historyQuery, setHistoryQuery] = useState("");
  const { scrollToMessage } = useMessageScroller();

  // Jump list addresses rows by the ids the transcript assigned, so it goes
  // through the same builder rather than reading the DOM.
  const questions = useMemo(() => {
    const ids = turnIdsFor(messages);
    return messages
      .map((m, i) => ({ message: m, turnId: ids[i] }))
      .filter(({ message }) => message.question.trim() !== "");
  }, [messages]);

  const filteredQuestions = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(({ message }) =>
      message.question.toLowerCase().includes(q),
    );
  }, [questions, historyQuery]);

  const openHistory = () => {
    setHistoryIndex(-1);
    setHistoryQuery("");
    setHistoryOpen(true);
  };
  const closeHistory = () => setHistoryOpen(false);

  // Reset highlight when the query changes so ↵ doesn't jump to a stale row.
  const changeHistoryQuery = (q: string) => {
    setHistoryQuery(q);
    setHistoryIndex(-1);
  };

  // Cmd/Ctrl+K toggles the palette. Escape closes when open. Skipped while
  // this body is the one being left: for the length of the exit two bodies
  // are mounted, and both would answer the same keystroke.
  useEffect(() => {
    if (ghost) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !onHistory
      ) {
        e.preventDefault();
        if (historyOpen) closeHistory();
        else openHistory();
        return;
      }
      if (historyOpen && e.key === "Escape") {
        e.preventDefault();
        closeHistory();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [historyOpen, onHistory, ghost]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryIndex((i) => Math.min(filteredQuestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = historyIndex >= 0 ? historyIndex : 0;
      const pick = filteredQuestions[idx];
      if (pick) jumpTo(pick.turnId);
    }
  };

  const jumpTo = (turnId: string) => {
    closeHistory();
    scrollToMessage(turnId, { align: "start" });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="pc-toolbar">
        {onHistory ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onHistory}
                className="pc-tool"
                aria-label="Chat history"
              >
                <HistoryIcon className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Chat history</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => (historyOpen ? closeHistory() : openHistory())}
                className="pc-tool"
                aria-expanded={historyOpen}
                aria-haspopup="dialog"
                aria-label="Chat history"
              >
                <HistoryIcon className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
        )}
        <div className="ml-auto flex items-center gap-2">
          {onNewChat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    onNewChat();
                  }}
                  disabled={isStreaming}
                  className="pc-tool"
                  aria-label="New chat"
                >
                  <PlusCircleIcon className="size-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>New chat</TooltipContent>
            </Tooltip>
          )}
          {!docked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleEnlarged}
                  className="pc-tool"
                  aria-label={enlarged ? "Shrink chat" : "Expand chat"}
                  aria-pressed={enlarged}
                >
                  {enlarged ? (
                    <Minimize2Icon className="size-[18px]" />
                  ) : (
                    <Maximize2Icon className="size-[18px]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{enlarged ? "Shrink" : "Expand"}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleDock}
                className="pc-tool"
                aria-label={docked ? "Undock chat" : "Dock chat to the side"}
                aria-pressed={docked}
              >
                <PanelRightIcon className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {docked ? "Float over page" : "Dock to side"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onClose}
                className="pc-tool"
                aria-label="Close chat"
              >
                <XIcon className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Close chat</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ChatTranscript
        messages={messages}
        starterPrompts={starterPrompts}
        onSend={onSend}
        isConnected={isConnected}
        error={error}
        waitingText={waitingText}
      />

      <div className="pc-composer">
        {banner}
        <PromptInput
          onSubmit={(msg) => onSend(msg.text)}
          className="bg-white dark:bg-popover"
        >
          <PromptInputBody>
            <PromptInputTextarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.currentTarget.blur();
                  onDismiss();
                }
              }}
              placeholder={isConnected ? placeholder : connectingPlaceholder}
              disabled={!isConnected}
              aria-busy={isStreaming || undefined}
              className="min-h-11"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              {modeToggle}
              <PromptInputButton>
                <Plus />
              </PromptInputButton>
              <PromptInputButton>
                <Paperclip />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              status={isStreaming ? "streaming" : "ready"}
              disabled={!isConnected}
              variant="cta"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>

      {historyOpen && !onHistory && (
        <>
          <div
            className="pc-scrim"
            onClick={closeHistory}
            aria-hidden="true"
          />
          <div
            className="pc-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a question"
          >
            <div className="pc-palette-header">
              <span className="pc-palette-title">History</span>
              <kbd className="pc-kbd" aria-hidden="true">
                ⌘K
              </kbd>
            </div>
            <div className="pc-palette-search">
              <Search
                value={historyQuery}
                onValueChange={changeHistoryQuery}
                onKeyDown={onSearchKeyDown}
                placeholder="Search"
                aria-label="Search questions in this conversation"
              />
            </div>
            <div className="pc-palette-list" role="listbox">
              {filteredQuestions.length === 0 ? (
                <p className="pc-palette-empty">
                  {questions.length === 0 ? "No questions yet." : "No matches."}
                </p>
              ) : (
                filteredQuestions.map(({ message, turnId }, i) => (
                  <button
                    key={turnId}
                    type="button"
                    role="option"
                    aria-selected={i === historyIndex}
                    data-active={i === historyIndex || undefined}
                    onMouseEnter={() => setHistoryIndex(i)}
                    onClick={() => jumpTo(turnId)}
                    className="pc-palette-item"
                  >
                    {message.question}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </TooltipProvider>
  );
};
