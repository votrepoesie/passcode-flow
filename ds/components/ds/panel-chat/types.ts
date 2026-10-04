import type { ReactNode } from "react";

/**
 * One question / answer exchange the surface renders.
 *
 * Kept minimal on purpose: the platform's `QAPair` also carries an activity
 * trace, structured content blocks and per-turn selections, but v1 of the DS
 * component ships the shell only — no reasoning trace, no dynamic blocks.
 * Consumers pass rendered React for the answer if they want markdown /
 * streamed markdown / anything richer than plain text.
 */
export interface PanelChatMessage {
  /** Stable across the life of the row — becomes the MessageScroller item id. */
  id: string;
  /** Milliseconds — used as the fallback stable id when `id` is not stable. */
  timestamp: number;
  question: string;
  /** Plain text or any pre-rendered React (e.g. `<MessageResponse>`). */
  answer: ReactNode;
  /**
   * The row is waiting for a reply (question sent, nothing back yet).
   * Different from `isStreaming` on the surface — the surface flag is a global
   * "a stream is running somewhere"; this flag is per-row.
   */
  pending?: boolean;
}
