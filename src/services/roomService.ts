import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';
import { userDtoFields } from './userService';

// TODO: Afraid I'm going to have to write actual types for these...
const roomDtoFields = getSchemaProperties(spec.components.schemas.Room);
type RoomDto = { [Property in typeof roomDtoFields[number] ]: any } & { createdAt: Date };

function getRoomDto(room: HydratedDocument<IRoom>): RoomDto {
  const roomDto = serializeDocument(room, roomDtoFields);
  roomDto.creator = filterObject(roomDto.creator, userDtoFields);
  return roomDto as RoomDto & { createdAt: Date };
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(roomDtoFields.join(' '))
    .populate('creator')
    .exec();
}

const getRooms = async (limit: number, rawCursor?: string) => {
  const cursor = deserializeTimestampCursor(rawCursor);

  const paginationInfo: PaginationInfo<any> = { limit, cursor };

  const query = getPaginatedQuery(Room, paginationInfo);

  const rooms = await completeQuery(query);

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
