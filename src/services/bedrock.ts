import dgram from "node:dgram";

export type BedrockPingResult = {
  online: boolean;
  latency: number;
  players: { online: number; max: number } | null;
  motd: string | null;
  version: string | null;
};

export async function pingBedrock(host: string, port?: number) {
  const p = port ?? 19132;
  const start = Date.now();
  const socket = dgram.createSocket("udp4");
  let closed = false;
  const safeClose = () => {
    if (!closed) {
      closed = true;
      socket.close();
    }
  };

  const pk = Buffer.alloc(1 + 8 + 16 + 2);
  pk.writeUInt8(0x01, 0); // Unconnected Ping
  pk.writeBigUInt64BE(BigInt(Date.now()), 1);
  Buffer.from("00ffff00fefefefefdfdfdfd12345678", "hex").copy(pk, 9);
  pk.writeUInt16BE(p, 25);

  let info: Buffer | null = null;
  try {
    await new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        safeClose();
        resolve();
      }, 2500);
      socket.once("message", (msg) => {
        clearTimeout(t);
        info = msg;
        safeClose();
        resolve();
      });
      socket.send(pk, p, host, (err) => {
        if (err) {
          clearTimeout(t);
          safeClose();
          resolve();
        }
      });
    });
  } catch {
    safeClose();
  }

  const latency = Date.now() - start;
  if (!info) {
    return {
      online: false,
      players: null,
      motd: null,
      version: "latest",
      latency,
    };
  }

  const packet = info as Buffer;
  const i = packet.toString("utf8");
  const payload = i.includes("MCPE;") ? i.slice(i.indexOf("MCPE;")) : i;
  const parts = payload.split(";");
  const motd = parts[1] || null;
  const players = Number(parts[4] ?? NaN);
  const max = Number(parts[5] ?? NaN);
  const version = parts[3] || "latest";

  return {
    online: true,
    players: {
      online: Number.isFinite(players) ? players : 0,
      max: Number.isFinite(max) ? max : 0,
    },
    motd,
    version,
    latency,
  };
}
