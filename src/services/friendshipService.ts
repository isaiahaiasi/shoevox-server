import spec from '@isaiahaiasi/voxelatlas-spec/schema.json';
import mongoose, { HydratedDocument } from 'mongoose';
import Friendship, { IFriendship } from '../models/Friendship';
import { userDtoFields } from '../types/dtos';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { serializeDocument, filterObject } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

const friendshipDtoFields = getSchemaProperties(spec.components.schemas.Friendship);

function getFriendshipDto(friendship: HydratedDocument<IFriendship>) {
  const friendshipDto = serializeDocument(friendship, friendshipDtoFields);

  // users may or may not be populated
  if (!mongoose.Types.ObjectId.isValid(friendshipDto.recipient.toString())) {
    friendshipDto.recipient = filterObject(friendshipDto.recipient, userDtoFields);
  }
  if (!mongoose.Types.ObjectId.isValid(friendshipDto.requester.toString())) {
    friendshipDto.requester = filterObject(friendshipDto.requester, userDtoFields);
  }

  return friendshipDto;
}

async function getFriendships(friendshipData: {
  userId: string,
  userIs: 'recipient' | 'requester',
  limit: number,
  cursor?: string,
  status?: 'ACCEPTED' | 'PENDING' | 'REJECTED',
}) {
  const {
    userId, userIs, limit, cursor: rawCursor, status,
  } = friendshipData;

  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<any> = { cursor, limit };

  const filterQuery = { [userIs]: userId };

  if (status) {
    filterQuery.status = status;
  }

  const friendships = await getPaginatedQuery<IFriendship>(
    Friendship,
    paginationInfo,
    filterQuery,
  )
    .populate(userIs === 'recipient' ? 'requester' : 'recipient')
    .exec();

  return friendships.map(getFriendshipDto);
}

export default {
  getFriendships,
};
