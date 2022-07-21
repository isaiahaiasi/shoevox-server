import { HydratedDocument, Query } from 'mongoose';
import Room, { IRoom } from '../models/Room';
import { Dto, dtoFields } from '../types/dtos';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

interface RequiredRoomInputs {
  title: string;
  creator: string;
}

function getRoomDto(room: HydratedDocument<IRoom>) {
  const roomDto = serializeDocument(room, dtoFields.room);
  roomDto.creator = filterObject(roomDto.creator, dtoFields.user);
  return roomDto as Dto['Room'];
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(dtoFields.room.join(' '))
    .populate('creator')
    .exec();
}

const getRooms = async (limit: number, rawCursor?: string) => {
  const cursor = deserializeTimestampCursor(rawCursor);

  const paginationInfo: PaginationInfo<IRoom> = { limit, cursor };

  const query = getPaginatedQuery(Room, paginationInfo);

  const rooms = await completeQuery(query);

  return rooms.map(getRoomDto);
};

// TODO: This isn't very DRY... but idk yet how I want to make the generic interface
const getRoomsByUserId = async (
  userId: string,
  limit: number,
  rawCursor?: string,
) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<IRoom> = { limit, cursor };
  const query = getPaginatedQuery(Room, paginationInfo, { creator: userId });
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

const createRoom = async (roomData: RequiredRoomInputs) => {
  const room = await new Room(roomData)
    .save()
    .then((res) => res.populate('creator'));

  return getRoomDto(room);
};

const deleteRoom = async (roomId: string, userId: string) => {
  // TODO: Explicit authorization
  const deletedRoom = await Room.findOneAndDelete({ _id: roomId, creator: userId }).exec();

  if (!deletedRoom) {
    throw Error(`Could not find Room with id ${roomId} to delete!`);
  }

  return getRoomDto(deletedRoom);
};

const updateRoom = async (roomData: RequiredRoomInputs & { id: string }) => {
  const updatedRoom = await Room.findByIdAndUpdate(roomData.id, roomData).exec();

  if (!updatedRoom) {
    throw Error(`Could not find Room with id ${roomData.id} to delete!`);
  }

  return getRoomDto(updatedRoom);
};

export default {
  createRoom,
  deleteRoom,
  getRooms,
  getRoomById,
  getRoomsByUserId,
  updateRoom,
};
