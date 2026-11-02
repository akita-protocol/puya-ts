/**
 * Types for the ARC-56 `ui` extension: presentation metadata that the compiler copies verbatim into
 * the ARC-56 app spec, so wallets, explorers and embeds can show a contract's methods with an icon and
 * label, and build calls to them from a small form ("card"), without a hand-written client.
 *
 * Every value must be a compile-time literal. Unknown keys are allowed and passed through unchanged,
 * so the format can grow without a compiler change.
 */

/** Any JSON value that can be written as a literal */
export type UiJson = string | number | boolean | readonly UiJson[] | { readonly [key: string]: UiJson | undefined }

/** A value the client reads to show in a card or to fill an argument */
export type UiSource =
  /** Global state key, as named in the ARC-56 spec */
  | { source: 'global'; data: string }
  /** Local state key of the viewer's account */
  | { source: 'local'; data: string }
  /** Box key, as named in the ARC-56 spec */
  | { source: 'box'; data: string }
  /** The result of a readonly method with no arguments */
  | { source: 'method'; data: string }
  /** The value of another argument of this method */
  | { arg: string }
  /** A literal value */
  | { const: UiJson }

/** How the client fills one ABI argument when it builds the call */
export type UiArgBinding =
  /** The id or address of the entity the card is shown for, e.g. the app id of a listing */
  | 'ref'
  /** The viewer's account */
  | 'sender'
  /** For ARC-58 plugins: the viewer's ARC-58 wallet app id */
  | 'wallet'
  /** For ARC-58 plugins: whether to rekey back to the wallet, set by the plugin call wrapper */
  | 'rekeyBack'
  | UiSource
  /** The viewer enters the value */
  | {
      input: 'amount' | 'count' | 'asset' | 'address' | 'text' | 'choice' | 'toggle'
      label?: string
      min?: number
      max?: number
      /** For `choice`, the options to pick from */
      options?: readonly { label: string; value: UiJson }[]
      /** For `amount`, the asset the amount is in; 0 or omitted means ALGO */
      asset?: UiSource
      [key: string]: UiJson | undefined
    }

/** A computed amount: a source, or the sum or product of sources */
export type UiAmount = UiSource | { add: readonly UiAmount[] } | { mul: readonly UiAmount[] }

/** A small form that lets a viewer call the method */
export type UiCard = {
  /** Values to show above the inputs */
  show?: readonly { label: string; from: UiSource; format?: 'amount' | 'time' | 'duration' | 'address' | 'asset' | 'text' }[]
  /** How each ABI argument is filled, keyed by argument name */
  bind?: { readonly [argName: string]: UiArgBinding }
  /** A payment the call needs, made by the viewer to the app (or to `receiver`) right before the call */
  pay?: { amount: UiAmount; asset?: UiSource; receiver?: UiSource }
  /** When the card can be used; while false, the card shows but its button is disabled */
  enabled?: { before?: UiSource; after?: UiSource }
  /** Confirmation text; `{argName}` is replaced with that argument's value */
  confirm?: string
  [key: string]: UiJson | undefined
}

/** Presentation metadata for one ABI method */
export type MethodUi = {
  /** A stable, machine-readable name for what the method does, e.g. `raffle_enter` */
  action?: string
  /** An icon name from the shared glyph set, e.g. `Ticket` */
  glyph?: string
  /** A short, human-readable label, e.g. `Enter raffle` */
  label?: string
  /** A form for calling the method */
  card?: UiCard
  [key: string]: UiJson | undefined
}

/** Presentation metadata for the contract as a whole */
export type ContractUi = {
  /** An icon name from the shared glyph set */
  glyph?: string
  /** The contract's own icon, as SVG path data on a 24 by 24 grid */
  svg?: string
  /** The contract's color, as a CSS hex color */
  color?: string
  /** The `action` to show when only the contract is known, not the method */
  defaultAction?: string
  [key: string]: UiJson | undefined
}
