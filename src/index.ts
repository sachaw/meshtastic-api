import {
  IHTTPConnection,
  Protobuf,
  SettingsManager,
} from '@meshtastic/meshtasticjs';
import { App } from '@tinyhttp/app';

import { handlePacket } from './connections.js';
import { RegisterSubscribers } from './events.js';
import { prisma } from './prisma.js';

const app = new App();

SettingsManager.debugMode = Protobuf.LogRecord_Level.TRACE;
export const connection = new IHTTPConnection();

RegisterSubscribers();

app
  .get("/", (_, res) => {
    res.status(200);
  })
  .get("/connect", async (_, res) => {
    await connection.connect({
      address: "192.168.1.216",
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

  .post("/ingest", (req, res) => {
    const packet = JSON.parse(req.body);
    handlePacket(packet);
  })

  .listen(3000, () => console.log("Started on http://localhost:3000"));
