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
  .get("/", (_, res) => {
    res.status(200);
  })
  .get("/connect", async (_, res) => {
    await connection.connect({
      address: "192.168.1.223",
      tls: false,
      receiveBatchRequests: false,
      fetchInterval: 2000,
    });
    res.json(connection.url);
  })

  //API Routes,

  .get("/nodes", async (_, res) => {
    res.json(
      await prisma.node.findMany({
        include: {
          position: true,
        },
      })
    );
  })
  .get("/positions", async (_, res) => {
    res.json(await prisma.position.findMany());
  })
  .get("/node/:id", async (req, res) => {
    res.json(
      await prisma.node.findUnique({
        where: {
          id: req.params.id,
        },
      })
    );
  })
  .get("/node/:id/position", async (req, res) => {
    res.json(
      await prisma.node.findUnique({
        where: {
          id: req.params.id,
        },
      })
    );
  })
  .get("/node/:id/positions", async (req, res) => {
    res.json(
      await prisma.node.findUnique({
        where: {
          id: req.params.id,
        },
      })
    );
  })

  .listen(3000, () => console.log("Started on http://localhost:3000"));
