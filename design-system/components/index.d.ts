/** Behaviour helpers from components/bundle.js, available as window.Aljamea. */
declare namespace Aljamea {
  /** Wires every [data-aj-menu], [data-aj-tabs] and [data-aj-shelf] under root, and numbers .aj-stagger children. Call once per page. */
  function init(root?: ParentNode): void;
  /** Disclosure menu: a button with aria-controls pointing at a ul.aj-menu. Opens on click, Enter, Space or ArrowDown; Escape closes and returns focus. */
  function menu(trigger: HTMLButtonElement): void;
  /** Shows a toast in a polite live region; stays 5s unless hovered or focused. */
  function toast(text: string, options?: { action?: string; href?: string; onAction?: () => void; duration?: number }): { dismiss(): void };
  /** Rosette loader for long waits. begin() starts the progress bar now and shows the rosette after afterMs (default 1200). bind() wires links and forms; labels come from data-aj-loading. */
  const loader: { show(label?: string): void; hide(): void; begin(label?: string | null, afterMs?: number): void; bind(): void };
  /** The 3px progress bar on the header edge. */
  const progress: { start(): void; done(): void; set(value: number): void };
  /** Puts a button in its loading state until the promise settles. Width stays fixed; repeat presses are ignored. */
  function busy<T>(button: HTMLElement, promise: Promise<T> | T): Promise<T>;
  /** Tabs with roving tabindex, reading-direction arrow keys and a sliding indicator. */
  function tabs(root: HTMLElement): void;
  /** Cover shelf with previous/next buttons that page by the visible width. */
  function shelf(root: HTMLElement): void;
  /** Two-tier header: adds .is-stuck to the sticky bar when the top tier leaves the viewport. Called by init(). */
  function masthead(bar: HTMLElement): void;
  /** English/Arabic toggle. Without onChange it navigates to the link and tags the next page so it wipes in its reading direction; with onChange it switches in place inside a view transition. init() wires [data-aj-lang] without onChange. */
  function lang(root: HTMLElement, options?: { onChange?: (code: string) => void }): void;
  /** Opens <dialog class="aj-drawer"> from a [data-aj-drawer] trigger; closes on Escape, backdrop click or [data-aj-close]; returns focus. */
  function drawer(trigger: HTMLElement): void;
  /** Toggle chip: flips aria-pressed and dispatches "aj:toggle" {value, pressed}. Menus with role="menuitemradio" items dispatch "aj:select" {value} on their trigger. */
  function chip(button: HTMLButtonElement): void;
  /** Runs a DOM change inside a View Transition when supported and motion is allowed. */
  function transition(update: () => void): Promise<void>;
  /** Numbers .aj-stagger children and plays the entrance once per visit. */
  function stagger(root?: ParentNode): void;
}
