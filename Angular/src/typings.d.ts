interface Window {
  top: Window & typeof globalThis;
  self: Window & typeof globalThis;
}
