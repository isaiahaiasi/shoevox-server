import { RequestHandler } from 'express';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getPaginationParams } from '../utils/pagination';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);

  let cursor;

  if (rawCursor) {
    const [id, createdAt] = rawCursor.split(',');
    cursor = { createdAt: createdAt as string, id: id as string };
  }

  const rooms = await roomService.getRooms(limit, cursor);

  // const nextCursor = rooms.length > 0
  //   ? [rooms[rooms.length - 1].id, rooms[rooms.length - 1].createdAt]
  //   : [];

  res.json(rooms);
};

const getRoomById: RequestHandler = async (req, res, next) => {
  const { roomid } = req.params;
  const room = await roomService.getRoomById(roomid);

  if (room) {
    res.json(room);
  } else {
    const { originalUrl: fullPath } = req;
    const resource = 'room';
    next(
      createResourceNotFoundError({ resource, identifier: roomid, fullPath }),
    );
  }
};

export default {
  getRooms,
  getRoomById,
};
