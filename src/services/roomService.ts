import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { getPaginatedQuery, PaginationInfo } from '../utils/pagination';
import { userDtoFields } from './userService';

export interface RoomCursor {
  createdAt: string;
  id: string;
}

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

const getRooms = async (limit: number, cursor?: RoomCursor) => {
  const paginationInfo: PaginationInfo<any> = {
    limit,
    cursor: [
      // This cursor array does not guarantee uniqueness,
      {
        field: 'createdAt',
        value: cursor ? new Date(cursor.createdAt) : undefined,
        order: 'desc',
      },
      { field: '_id', value: cursor?.id },
    ],
  };

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
