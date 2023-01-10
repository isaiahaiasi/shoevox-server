import { Dto, dtoFields } from '@isaiahaiasi/voxelatlas-spec';
import { FilterQuery, HydratedDocument } from 'mongoose';
import Friendship, { IFriendship } from '../models/Friendship';
import { filterObject, getPaginatedQuery, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, PaginationInfo, RawPaginationInfo } from '../utils/paginationHelpers';
import { getUserDto } from './userService';

export interface FriendshipRequestData {
  userId: string;
  userIsRecipient?: boolean;
  status?: 'ACCEPTED' | 'PENDING' | 'REJECTED';
  paginationParams: RawPaginationInfo;
  populate?: boolean;
}

function getFriendshipDto(friendship: HydratedDocument<IFriendship>) {
  const friendshipDto = serializeDocument(friendship, dtoFields.friendship);

  friendshipDto.recipient = filterObject(friendshipDto.recipient, dtoFields.user);
  friendshipDto.requester = filterObject(friendshipDto.requester, dtoFields.user);

  return friendshipDto as Dto['Friendship'];
}

export async function getFriendshipDocuments(friendshipData: FriendshipRequestData) {
  const {
    userId,
    userIsRecipient,
    status,
    paginationParams: { limit, cursor: rawCursor },
    populate = true,
  } = friendshipData;

  const cursor = deserializeTimestampCursor(rawCursor);
  const paginationInfo: PaginationInfo<IFriendship> = { cursor, limit };

  const filterQuery: FilterQuery<IFriendship> = {};

  // Filter by whether given user is requester, recipient, or either
  // (if no option is provided, default to "either")
  if (userIsRecipient != null) {
    filterQuery[userIsRecipient ? 'recipient' : 'requester'] = userId;
  } else {
    filterQuery.$or = [
      { recipient: userId },
      { requester: userId },
    ];
  }

  if (status) {
    filterQuery.status = status;
  }

  const query = getPaginatedQuery<IFriendship>(
    Friendship,
    paginationInfo,
    filterQuery,
  );

  return populate
    ? query.populate(['recipient', 'requester']).exec()
    : query.exec();
}

/** Returns Friendship resources, which are similar to Friendship data model */
async function getFriendships(friendshipData: FriendshipRequestData) {
  const friendships = await getFriendshipDocuments(friendshipData);

  return friendships.map(getFriendshipDto);
}

/** Returns Friend resources, which are more usable than Friendships */
async function getFriends(friendshipData: FriendshipRequestData) {
  const friendships = await getFriendshipDocuments(friendshipData);

  return friendships.map((friendship) => {
    // Need to cast because @types/mongoose doesn't register effect of populate()
    const userIsRecipient = friendshipData.userId === (friendship.recipient as any)._id.toString();

    const user = userIsRecipient ? friendship.requester : friendship.recipient;

    return {
      user: getUserDto(user as any),
      initiator: userIsRecipient,
      status: friendship.status,
      id: friendship._id,
      createdAt: friendship.createdAt,
    };
  });
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
  getFriends,
  createFriendship,
  updateFriendship,
};
