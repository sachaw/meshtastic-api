import { Protobuf } from '../node_modules/@meshtastic/meshtasticjs/dist/index.js';
import { connection, prisma } from './index.js';

const addNode = async (node: Protobuf.NodeInfo): Promise<void> => {
  await prisma.node.upsert({
    where: {
      number: node.num,
    },
    create: {
      number: node.num,
      lastHeard: new Date(node.lastHeard),
      nodeId: node.user?.id,
      longName: node.user?.longName,
      shortName: node.user?.shortName,
    },
    update: {
      lastHeard: new Date(node.lastHeard),
      nodeId: node.user?.id,
      longName: node.user?.longName,
      shortName: node.user?.shortName,
    },
  });

  if (node.num !== 0xffffffff) {
    await prisma.sNR.create({
      data: {
        snr: node.snr,
        node: {
          connect: {
            number: node.num,
          },
        },
      },
    });
  }
};

const addPosition = async (
  position: Protobuf.Position,
  nodeNum: number
): Promise<void> => {
  await prisma.position.create({
    data: {
      lat: position.latitudeI,
      lon: position.longitudeI,
      alt: position.altitude,
      batt: position.batteryLevel,
      node: {
        connect: {
          number: nodeNum,
        },
      },
    },
  });
};

export const RegisterSubscribers = () => {
  connection.onMeshPacket.subscribe(async (packet) => {
    if (packet.to === 0xffffffff) {
      await addNode(
        Protobuf.NodeInfo.create({
          num: 0xffffffff,
        })
      );
    }
    const nodes = await prisma.node.findMany({
      where: {
        number: {
          in: [packet.from, packet.to],
        },
      },
    });

    await Promise.all(
      [packet.from, packet.to].map(async (number) => {
        nodes.find((node) => node.number === number) ||
          (await addNode(
            Protobuf.NodeInfo.create({
              num: number,
            })
          ));
      })
    );
  });
  connection.onNodeInfoPacket.subscribe(async (packet) => {
    await addNode(packet.data);
  });

  connection.onPositionPacket.subscribe(async (packet) => {
    await addPosition(packet.data, packet.packet.from);
  });

  connection.onTextPacket.subscribe(async (packet) => {
    await prisma.message.create({
      data: {
        message: packet.data,
        from: {
          connect: {
            number: packet.packet.from,
          },
        },
        to: {
          connect: {
            number: packet.packet.to === 0xffffffff ? -1 : packet.packet.to,
          },
        },
      },
    });
  });
};
