"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** One selectable ledger row — checkbox leads, selection in foreground. */
function OptionRow({
  opt,
  chosen,
  selectable,
  onToggle,
}: {
  opt: string;
  chosen: boolean;
  selectable: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onToggle}
      aria-pressed={chosen}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors disabled:cursor-default",
        chosen
          ? "bg-secondary font-medium text-foreground dark:bg-accent"
          : "text-muted-foreground enabled:hover:bg-secondary enabled:hover:text-foreground dark:enabled:hover:bg-accent"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors",
          chosen
            ? "border-foreground bg-foreground text-background"
            : "border-input bg-transparent dark:border-muted-foreground/50"
        )}
      >
        {chosen && <Check className="size-3" strokeWidth={3} />}
      </span>
      {opt}
    </button>
  );
}

/**
 * MultipleChoice — the assistant's multiple-choice question in a chat stream.
 * A ledger of selectable options (checkbox leads each row) plus an
 * optional free-form typed answer. States:
 *  - awaiting: no answer yet → card is open, options are selectable, Submit
 *    records the choice in place (and hands it to the chat via `onSubmit`).
 *  - answered: a choice is recorded (via `answer` prop or in place) → read-only,
 *    collapsed to the chosen option(s), with "Ask chat" + "Edit" actions.
 *  - editing: "Edit" reopens the recorded answer for re-selection.
 */
export function MultipleChoice({
  label = "Question",
  question,
  options,
  answer,
  awaiting = false,
  onSubmit,
  onAskChat,
}: {
  label?: string;
  question: string;
  options: string[];
  /** Prebaked single answer — renders the card in its read-only answered state. */
  answer?: string;
  /** Open + selectable, awaiting a response. */
  awaiting?: boolean;
  onSubmit?: (answer: string) => void;
  /** "Ask chat" action on an answered card — send a follow-up to the chat. */
  onAskChat?: () => void;
}) {
  // Options can be multi-selected (tracked by value, so typed answers slot in);
  // the user can also type a free-form answer.
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [localAnswers, setLocalAnswers] = useState<string[] | null>(null);
  const [editing, setEditing] = useState(false);

  // The confirmed answer(s). An in-place answer wins over the prebaked prop, so
  // editing a prop-seeded card takes over cleanly.
  const finalAnswers = localAnswers ?? (answer != null ? [answer] : null);
  const answered = finalAnswers != null;
  // Selectable = collecting a fresh answer, or re-opening a recorded one.
  const selectable = editing || (!answered && awaiting);
  const [expanded, setExpanded] = useState(!answered && awaiting);

  const toggle = (opt: string) =>
    setSel((prev) => {
      const next = new Set(prev);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });

  const submit = () => {
    const picked = displayOptions.filter((o) => sel.has(o));
    const typed = custom.trim();
    const all = typed ? [...picked, typed] : picked;
    if (all.length === 0) return;
    setLocalAnswers(all);
    setEditing(false);
    onSubmit?.(all.join(", "));
    setCustom("");
  };

  // "Edit" reopens the recorded answer: preseed the selection and make the
  // ledger live again.
  const startEdit = () => {
    setSel(new Set(finalAnswers ?? []));
    setCustom("");
    setEditing(true);
    setExpanded(true);
  };

  const canSubmit = sel.size > 0 || custom.trim().length > 0;

  const chosen = (opt: string) =>
    selectable ? sel.has(opt) : (finalAnswers?.includes(opt) ?? false);

  // Once answered, typed answers that aren't among the preset options render as
  // their own shaded boxes in the grid.
  const extras = finalAnswers
    ? finalAnswers.filter((a) => !options.includes(a))
    : [];
  const displayOptions = [...options, ...extras];

  // The chosen option values, in preset-then-typed order — used for the
  // collapsed answered summary.
  const chosenOptions = displayOptions.filter(chosen);

  const optionRow = (opt: string) => (
    <OptionRow
      key={opt}
      opt={opt}
      chosen={chosen(opt)}
      selectable={selectable}
      onToggle={() => toggle(opt)}
    />
  );

  return (
    <div className="w-full max-w-[742px] rounded-lg border border-border-subtle bg-popover px-5 py-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="shrink-0 font-medium text-label text-muted-foreground">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground"
        >
          {expanded ? "Collapse" : "Expand"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      </div>

      <p className="text-base leading-relaxed text-foreground">
        {question}
      </p>

      {/* Collapsed + answered: show only the chosen option(s) as the summary. */}
      {!expanded && answered && chosenOptions.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5">
          {chosenOptions.map(optionRow)}
        </div>
      )}

      {expanded && (
        <>
          {selectable && (
            <p className="mt-3 text-xs text-muted-foreground">
              Select all that apply, or type your own.
            </p>
          )}
          {/* Ledger rows — checkbox leads each option, selection
              reads in foreground. */}
          <div className="mt-3 flex flex-col gap-0.5">
            {displayOptions.map(optionRow)}
          </div>

          {selectable && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Type your own answer…"
                className="h-8 flex-1 rounded-md py-1"
              />
              <Button size="sm" onClick={submit} disabled={!canSubmit}>
                Submit
              </Button>
            </div>
          )}
        </>
      )}

      {/* Answered, read-only: send a follow-up to the chat or re-open to edit. */}
      {answered && !selectable && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onAskChat}>
            Ask chat
          </Button>
          <Button size="sm" onClick={startEdit}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
