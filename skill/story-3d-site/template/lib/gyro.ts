// Phone tilt → the same parallax the mouse gives on desktop.
// iOS needs an explicit permission request from a user gesture, so we ask on
// the first touch (the intro drawing / a gate press are natural moments).

export const gyro = { active: false, x: 0, y: 0 };

let asked = false;
let base: { beta: number; gamma: number } | null = null;

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if (!base) base = { beta: e.beta, gamma: e.gamma }; // hold pose at first reading = neutral
  gyro.active = true;
  gyro.x = Math.max(-1, Math.min(1, (e.gamma - base.gamma) / 25));
  gyro.y = Math.max(-1, Math.min(1, -(e.beta - base.beta) / 25));
}

export function initGyro() {
  if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return () => {};
  type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
  const DOE = (window as unknown as { DeviceOrientationEvent?: IOSOrientation }).DeviceOrientationEvent;
  if (!DOE) return () => {};

  const attach = () => window.addEventListener("deviceorientation", onOrient);
  const ask = async () => {
    if (asked) return;
    asked = true;
    try {
      if (typeof DOE.requestPermission === "function") {
        if ((await DOE.requestPermission()) === "granted") attach();
      } else attach();
    } catch {
      /* permission denied or insecure context (iOS needs HTTPS) — keep touch-only */
    }
  };
  window.addEventListener("touchend", ask, { once: true });
  return () => {
    window.removeEventListener("touchend", ask);
    window.removeEventListener("deviceorientation", onOrient);
  };
}
