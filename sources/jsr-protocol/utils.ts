export const PROTOCOL = "jsr:";

export const hasProcol = (str: string) => str.startsWith(PROTOCOL);
export const stripProtocol = (str: string) => str.slice(PROTOCOL.length);
