import {
  pino,
  transport,
  type DestinationStream,
  type TransportTargetOptions,
} from "pino";

const prettyTarget: TransportTargetOptions = {
  target: "pino-pretty",
  options: {
    singleLine: true,
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
    colorize: true,
    messageFormat: "{if collection}({collection}){end} {msg}",
  },
};

const stream = transport({
  targets: [prettyTarget],
}) as DestinationStream;

export const log = pino({ level: "info" }, stream);
