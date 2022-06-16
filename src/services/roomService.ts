import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { userDtoFields } from './userService';

const roomDtoFields = getSchemaProperties(spec.components.schemas.Room);
const PUBLIC_ROOM_FIELDS = roomDtoFields.join(' ') as typeof roomDtoFields[number];

function getRoomDto(room: HydratedDocument<IRoom>) {
  const roomDto = serializeDocument(room, roomDtoFields);
  roomDto.creator = filterObject(roomDto.creator, userDtoFields);
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
