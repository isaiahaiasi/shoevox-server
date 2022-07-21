import { zSchemas } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument } from 'mongoose';
import { z } from 'zod';
import Like, { ILike } from '../models/Like';
import { userDtoFields } from '../types/dtos';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

const likeSchema = zSchemas.resources.Like;
type LikeDto = z.infer<typeof likeSchema>;
const likeDtoFields = Object.keys(likeSchema.shape);

interface RequiredLikeInputs {
  user: string,
  room: string,
}

function getLikeDto(like: HydratedDocument<ILike>): LikeDto {
  const likeDto = serializeDocument(like, likeDtoFields);
  likeDto.user = filterObject(likeDto.user, userDtoFields);
  return likeDto as LikeDto;
}

const createLike = async ({ user, room }: RequiredLikeInputs) => {
  const like = await Like
    .findOneAndUpdate({ user, room }, { user, room }, { upsert: true, new: true })
    .populate('user')
    .exec();

  return getLikeDto(like);
};

const getLikesByRoomId = async (room: string, limit: number, rawCursor?: string) => {
  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<any> = { limit, cursor };
  const query = getPaginatedQuery(Like, paginationInfo, { room });

  const likes = await query.populate('user').exec();
  return likes.map(getLikeDto);
};

const deleteLike = async (likeId: string, userId: string) => {
  // TODO: right now, authorization is implicit in this step to avoid multiple DB Queries
  // I'd like to find a better solution at some point...
  const deletedLike = await Like.findOneAndDelete({ _id: likeId, user: userId });

  if (!deletedLike) {
    throw Error(`Could not find Like with id ${likeId} to delete!`);
  }

  return getLikeDto(deletedLike);
};

export default {
  createLike,
  getLikesByRoomId,
  deleteLike,
};
