import { RequestHandler } from 'express';
import commentService from '../services/commentService';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams } from '../utils/pagination';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);

  // Get cursor
  let cursor;
  if (rawCursor) {
    const [createdAt, id] = rawCursor.split(',');
    cursor = { createdAt: createdAt as string, id: id as string };
  }

  // Get rooms data
  const rooms = await roomService.getRooms(limit, cursor);

  // get "next" link
  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(rooms, limit, baseUrl, (room) => ([
    new Date(room.createdAt).toISOString(),
    room.id,
  ]));

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

const getCommentsByRoomId: RequestHandler = async (req, res) => {
  const { roomid } = req.params;
  const { limit, cursor: rawCursor } = getPaginationParams(req, 5);

  // get data
  const comments = await commentService.getCommentsByRoomId(roomid, limit, rawCursor);

  // get "next" link
  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(comments, limit, baseUrl, (comment) => ([
    new Date(comment.createdAt).toISOString(),
    comment.id,
  ]));

  res.json({
    count: comments.length,
    data: comments,
    links,
  });
};

export default {
  getRooms,
  getRoomById,
  getCommentsByRoomId,
};
