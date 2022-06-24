import { RequestHandler } from 'express';
import commentService from '../services/commentService';
import roomService from '../services/roomService';
import { createResourceNotFoundError } from '../utils/errorResponse';
import { getFullRequestUrl } from '../utils/expressHelpers';
import { getPaginationLinks, getPaginationParams, serializeTimestampCursor } from '../utils/paginationHelpers';

const getRooms: RequestHandler = async (req, res) => {
  const { limit, cursor: rawCursor } = getPaginationParams(req, 3);

  const rooms = await roomService.getRooms(limit, rawCursor);

  const baseUrl = getFullRequestUrl(req, false);
  const links = getPaginationLinks(rooms, baseUrl, limit, serializeTimestampCursor);

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

  const links = getPaginationLinks(comments, baseUrl, limit, serializeTimestampCursor);

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
