import { Dto, dtoFields } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument, Query } from 'mongoose';
import Comment from '../models/Comment';
import Like, { ILike } from '../models/Like';
import Room, { IRoom } from '../models/Room';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import {
  deserializeTimestampCursor, getPaginatedQuery, PaginationInfo, RawPaginationInfo,
} from '../utils/paginationHelpers';
import { FriendshipRequestData, getFriendshipDocuments } from './friendshipService';

interface RequiredRoomInputs {
  title: string;
  creator: string;
}

async function getRoomDto(room: HydratedDocument<IRoom>) {
  const roomDto = serializeDocument(room, dtoFields.room);

  const [likeCount, commentCount] = await Promise.all([
    Like.countDocuments({ room: roomDto.id }).exec(),
    Comment.countDocuments({ room: roomDto.id }).exec(),
  ]);

  roomDto.likeCount = likeCount;
  roomDto.commentCount = commentCount;
  roomDto.creator = filterObject(roomDto.creator, dtoFields.user);

  return roomDto as Dto['Room'];
}

function completeQuery<T, Q>(query: Query<T, Q>) {
  return query
    .select(dtoFields.room.join(' '))
    .populate('creator')
    .exec();
}

const getRooms = async ({
  limit,
  cursor: rawCursor,
}: RawPaginationInfo) => {
  const cursor = deserializeTimestampCursor(rawCursor);

  const paginationInfo: PaginationInfo<IRoom> = { limit, cursor };

  const query = getPaginatedQuery(Room, paginationInfo);

  const rooms = await completeQuery(query);

  return Promise.all(rooms.map(getRoomDto));
};

// Get rooms where creator is a friend of given user
// TODO: This query is extremely inefficient because it iterates over friend list for each room
// It might even need to loop over every room???
// No idea how to properly write this query...
const getRoomsOfFriends = async (
  userId: string,
  { limit, cursor: rawCursor }: RawPaginationInfo,
) => {
  const friendshipData: FriendshipRequestData = {
    userId,
    status: 'ACCEPTED',
    paginationParams: { limit: 500 },
    populate: false,
  };

  const friends = await getFriendshipDocuments(friendshipData);

  const friendIds = friends
    .map((friend) => (friend.recipient.toString() === userId
      ? friend.requester
      : friend.recipient));

  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<IRoom> = { limit, cursor };

  const query = getPaginatedQuery(Room, paginationInfo, { creator: { $in: friendIds } });

  const rooms = await completeQuery(query);

  return Promise.all(rooms.map(getRoomDto));
};

const getRoomsByCreator = async (
  userId: string,
  {
    limit,
    cursor: rawCursor,
  }: RawPaginationInfo,
) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<IRoom> = { limit, cursor };

  const query = getPaginatedQuery(Room, paginationInfo, { creator: userId });
  const rooms = await completeQuery(query);
  return Promise.all(rooms.map(getRoomDto));
};

const getRoomsLikedByUser = async (
  userId: string,
  {
    limit,
    cursor: rawCursor,
  }: RawPaginationInfo,
) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<ILike> = { limit, cursor };

  const likes = await getPaginatedQuery(Like, paginationInfo, { user: userId }).exec();

  const roomIds = likes.map((like) => like.room);

  const roomQuery = Room.find({ _id: { $in: roomIds } });

  const rooms = await completeQuery(roomQuery);

  return Promise.all(rooms.map(getRoomDto));
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
  getRoomsByCreator,
  getRoomsLikedByUser,
  getRoomsOfFriends,
  updateRoom,
};
