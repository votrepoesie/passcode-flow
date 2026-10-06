// Stand-in for a server-side check. In a real flow the code is POSTed and
// compared on the server, so the passcode never ships in the client bundle.
const PASSCODE = "1234";
const LATENCY_MS = 1500;

/** Resolves to whether `code` is correct after simulated network latency. */
export function verifyPasscode(code: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(code === PASSCODE), LATENCY_MS);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
