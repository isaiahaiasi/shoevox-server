import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { includeUserFields } from './userService';

export const includeRoomFields = ['id', 'title', 'creator', 'url', 'createdAt'];
const PUBLIC_ROOM_FIELDS = includeRoomFields.join(' ');

function getRoomDto(room: HydratedDocument<IRoom>) {
  const roomDto = serializeDocument(room, includeRoomFields);
  roomDto.creator = filterObject(roomDto.creator, includeUserFields);
  return roomDto;
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(PUBLIC_ROOM_FIELDS)
    .populate('creator')
    .exec();
}

const getRooms = async () => {
  const rooms = await completeQuery(Room.find({}));

  return rooms.map(getRoomDto);
};

const getRoomById = async (id: string) => {
  const room = await completeQuery(Room.findById(id));

  if (!room) {
    return null;
  }

  return getRoomDto(room);
};

export default {
  getRooms,
  getRoomById,
};
