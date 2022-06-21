import { RequestHandler } from 'express';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getNextLink, getPaginationParams } from '../utils/pagination';
import { ApiResponseLinks } from '../utils/typeHelpers';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);

  // Get cursor
  let cursor;
  if (rawCursor) {
    const [id, createdAt] = rawCursor.split(',');
    cursor = { createdAt: createdAt as string, id: id as string };
  }

  // Get rooms data
  const rooms = await roomService.getRooms(limit, cursor);

  // Get "next" link
  let links: ApiResponseLinks = {};
  if (rooms.length === limit) {
    const nextCursor = [
      rooms[rooms.length - 1].id,
      new Date(rooms[rooms.length - 1].createdAt).toISOString(),
    ];

    links = {
      next: getNextLink(getFullRequestUrl(req, false), nextCursor, limit),
    };
  }

  res.json({
    data: rooms,
    links,
  });
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
