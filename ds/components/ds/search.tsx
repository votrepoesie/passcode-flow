"use client";

import * as React from "react";
import { Search as SearchIcon, X } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { FieldSlot, splitFieldProps, type FieldSlotProps } from "@/components/ui/field";

export type SearchProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "value" | "onChange"
> & {
  /** Current query (controlled). */
  value: string;
  /** Fires on every keystroke and when the clear button is pressed. */
  onValueChange: (value: string) => void;
  /** Wrapper className (applied to the InputGroup). */
  className?: string;
} & FieldSlotProps;

/**
 * DS search field — a leading magnifier, a text input, and a clear button
 * that appears once there's a query. Built on InputGroup so it inherits the
 * brand border, focus ring, and sizing. Controlled: own `value` in the parent
 * and filter your list from it.
 *
 * Errors: pass `label` / `error` / `errorAction` for the DS label line.
 * `error` is API-agnostic — a plain string: any non-empty string shows it,
 * `undefined` or `""` clears it. Map your API/form library's shape to it.
 * "No results" is an empty state, not an error.
 */
export function Search(allProps: SearchProps) {
  // `label` / `error` / `errorAction`… wrap the whole group in the DS label
  // line; the inner input reads the field for aria-invalid / describedby.
  const [field, { value, onValueChange, placeholder = "Search…", className, ...props }] =
    splitFieldProps(allProps);
  return (
    <FieldSlot field={field} id={props.id}>
      <InputGroup className={cn(className)}>
        <InputGroupAddon>
          <SearchIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          {...props}
        />
        {value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => onValueChange("")}
              aria-label="Clear search"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>
    </FieldSlot>
  );
}
