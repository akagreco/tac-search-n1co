import tls from "node:tls";

type SystemAwareTls = typeof tls & {
  getCACertificates?: (type?: "default" | "system" | "bundled" | "extra") => string[];
  setDefaultCACertificates?: (certificates: string[]) => void;
};

let initialized = false;

export function enableSystemCa() {
  if (initialized || process.env.USE_SYSTEM_CA === "false") return;
  initialized = true;
  try {
    const systemTls = tls as SystemAwareTls;
    if (!systemTls.getCACertificates || !systemTls.setDefaultCACertificates) return;
    const system = systemTls.getCACertificates("system");
    if (!system.length) return;
    const current = systemTls.getCACertificates("default");
    systemTls.setDefaultCACertificates([...new Set([...current, ...system])]);
  } catch {
    // Node anterior a 22.19 o almacén de certificados no disponible.
  }
}
