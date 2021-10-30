import {
  IHTTPConnection,
  Protobuf,
  SettingsManager,
} from '@meshtastic/meshtasticjs';
import pkg from '@prisma/client';
import { App } from '@tinyhttp/app';

import { RegisterSubscribers } from './events.js';

const { PrismaClient } = pkg;

const app = new App();

SettingsManager.debugMode = Protobuf.LogRecord_Level.TRACE;
export const connection = new IHTTPConnection();
export const prisma = new PrismaClient();

RegisterSubscribers();

app
  .get("/", function handler(_, res) {
    res.status(200);
  })
  .get("/connect", async function handler(_, res) {
    await connection.connect({
      address: "192.168.1.223",
      tls: false,
      receiveBatchRequests: false,
      fetchInterval: 2000,
    });

    res.json(connection.url);
  })
  .listen(3000, () => console.log("Started on http://localhost:3000"));
