import spec from '@isaiahaiasi/voxelatlas-spec/schema.json';
import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import { userDtoFields } from '../types/dtos';
import { getSchemaProperties, SchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

const roomDtoFields = getSchemaProperties(spec.components.schemas.Room);
type RoomDto = SchemaProperties<'Room'> & { createdAt: Date };

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
