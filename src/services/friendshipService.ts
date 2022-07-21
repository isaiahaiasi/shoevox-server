import { zSchemas } from '@isaiahaiasi/voxelatlas-spec';
import mongoose, { HydratedDocument } from 'mongoose';
import Friendship, { IFriendship } from '../models/Friendship';
import { userDtoFields } from '../types/dtos';
import { serializeDocument, filterObject } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

const friendshipSchema = zSchemas.resources.Friendship;
const friendshipDtoFields = Object.keys(friendshipSchema.shape);

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

async function createFriendship(friendshipData: { requester: string, recipient: string }) {
  // TODO: Currently possible for two friendships to exist for a single pair of users
  // I can either:
  // - make two queries to the DB to handle both cases
  // - create a new key for each Friendship entity, which is a combination of both users,
  //   but structured agnostic of who is requester & recipient
  const friendship = await Friendship
    .findOneAndUpdate(friendshipData, {}, { upsert: true, new: true })
    .populate('recipient')
    .exec();

  return getFriendshipDto(friendship);
}

async function updateFriendship(friendshipData: {
  friendshipId: string,
  userId: string,
  userIs: 'recipient' | 'requester',
  status: 'ACCEPTED' | 'REJECTED',
}) {
  const {
    friendshipId, userId, userIs, status,
  } = friendshipData;

  const findQuery = {
    _id: friendshipId,
    [userIs]: userId,
  };

  const friendship = await Friendship
    .findOneAndUpdate(findQuery, { status })
    .populate(userIs === 'recipient' ? 'requester' : 'recipient')
    .exec();

  return friendship ? getFriendshipDto(friendship) : null;
}

export default {
  getFriendships,
  createFriendship,
  updateFriendship,
};
