import { Dto, dtoFields } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument } from 'mongoose';
import Like, { ILike } from '../models/Like';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

interface RequiredLikeInputs {
  user: string,
  room: string,
}

function getLikeDto(like: HydratedDocument<ILike>) {
  const likeDto = serializeDocument(like, dtoFields.like);
  likeDto.user = filterObject(likeDto.user, dtoFields.user);
  return likeDto as Dto['Like'];
}

const createLike = async ({ user, room }: RequiredLikeInputs) => {
  const like = await Like
    .findOneAndUpdate({ user, room }, { user, room }, { upsert: true, new: true })
    .populate('user')
    .exec();

  return getLikeDto(like);
};

// TODO: Probably want to make a general "getLikes" service, with room OR user
const getLikesByRoomId = async (room: string, limit: number, rawCursor?: string) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<ILike> = { limit, cursor };
  const query = getPaginatedQuery(Like, paginationInfo, { room });

  const likes = await query.populate('user').exec();
  return likes.map(getLikeDto);
};

const getLikesByUserId = async (user: string, limit: number, rawCursor?: string) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<ILike> = { limit, cursor };
  const query = getPaginatedQuery(Like, paginationInfo, { user });

  const likes = await query.populate('user').exec();
  return likes.map(getLikeDto);
};

const getLike = async ({ room, user }: Record<'room' | 'user', string>) => {
  const like = await Like.findOne({ room, user }).populate('user').exec();

  return like ? getLikeDto(like) : null;
};

const deleteLike = async (likeId: string, userId: string) => {
  // TODO: right now, authorization is implicit in this step to avoid multiple DB Queries
  // I'd like to find a better solution at some point...
  const deletedLike = await Like
    .findOneAndDelete({ _id: likeId, user: userId })
    .populate('user')
    .exec();

  if (!deletedLike) {
    throw Error(`Could not find Like with id ${likeId} to delete!`);
  }

  return getLikeDto(deletedLike);
};

export default {
  createLike,
  getLikesByRoomId,
  getLikesByUserId,
  getLike,
  deleteLike,
};
