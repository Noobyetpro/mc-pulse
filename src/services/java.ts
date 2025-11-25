import { status } from "minecraft-server-util";

export type JavaPingResult = {
  online: boolean;
  latency: number | null;
  players: { online: number | null; max: number | null } | null;
  version: string | null;
  motd: string | null;
};

export async function pingJava(host: string, port: number) {
  try {
    const resp = await status(host, port, {
      timeout: 5000,
      enableSRV: true,
    });

    return {
      online: true,
      latency: resp.roundTripLatency ?? null,
      players: resp.players
        ? { online: resp.players.online ?? null, max: resp.players.max ?? null }
        : null,
      version: resp.version?.name ?? null,
      motd: resp.motd?.clean ?? null,
    } satisfies JavaPingResult;
  } catch (err) {
    return {
      online: false,
      latency: null,
      players: null,
      version: null,
      motd: null,
    } satisfies JavaPingResult;
  }
}
