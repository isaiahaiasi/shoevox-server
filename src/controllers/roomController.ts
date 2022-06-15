import { RequestHandler } from 'express';
import roomService from '../services/roomService';

export const getRooms: RequestHandler = async (req, res) => {
  const rooms = await roomService.getRooms();
  res.json(rooms);
};

export const getRoomById: RequestHandler = async (req, res, next) => {
  const { roomid } = req.params;
  const room = await roomService.getRoomById(roomid);

  if (room) {
    res.json(room);
  } else {
    // TODO: 404 helper.
    next({ status: 404, resource: 'room', entity: roomid });
  }
};
