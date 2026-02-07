interface Window {
  window: Window & typeof any;
  top: Window & typeof globalThis;
  self: Window & typeof globalThis;
}
