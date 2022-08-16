/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { initializeMongoose } from './config/mongooseConfig';
import Comment from './models/Comment';
import Friendship from './models/Friendship';
import Like from './models/Like';
import Room from './models/Room';
import User from './models/User';

// * Populate DB with dummy data

const NUM_USERS = 10;
const MAX_ROOMS_PER_USER = 10;
const MAX_LIKES_PER_ROOM = 20; // Cannot be more than NUM_USERS
const MAX_FRIENDSHIPS_PER_USER = 5; // Cannot be more than NUM_USERS
const MAX_COMMENTS_PER_ROOM = 7;

interface RefDependencies {
  [key: string]: { _id: string }[];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max + 1)) + min;
}

function truncate(input: string, maxLength: number) {
  return input
    .split('')
    .slice(0, Math.min(maxLength, input.length))
    .join('');
}

function getUsers() {
  const users = [];

  for (let i = 0; i < NUM_USERS; i++) {
    // Generate our own IDs so we don't have to await db updates for dependencies
    const _id = faker.database.mongodbObjectId();
    const username = faker.unique(() => truncate(faker.internet.userName(), 15));
    users.push({ username, _id });
  }

  return users;
}

function getRooms({ users }: RefDependencies) {
  const rooms = [];
  for (let i = 0; i < users.length; i++) {
    // Generate a random number of rooms per user
    const userRoomsCount = randInt(0, MAX_ROOMS_PER_USER);
    for (let j = 0; j < userRoomsCount; j++) {
      const _id = faker.database.mongodbObjectId();
      const title = `${faker.hacker.adjective()} ${faker.word.adjective()} ${faker.word.noun()}`;
      const creator = users[i]._id;
      rooms.push({ _id, title, creator });
    }
  }

  return rooms;
}

function getLikes({ users, rooms }: RefDependencies) {
  const likes: any[] = [];

  rooms.forEach((room) => {
    const numLikes = randInt(0, Math.min(users.length - 1, MAX_LIKES_PER_ROOM));
    const userIndexStart = randInt(0, users.length - 1 - numLikes);
    for (let i = 0; i < numLikes; i++) {
      const user = users[userIndexStart + i]._id;
      likes.push({ room: room._id, user });
    }
  });

  return likes;
}

function getComments({ users, rooms }: RefDependencies) {
  const comments: any[] = [];

  rooms.forEach((roomref) => {
    for (let i = 0; i < MAX_COMMENTS_PER_ROOM; i++) {
      const user = users[randInt(0, users.length - 1)]._id;
      const room = roomref._id;

      let content;
      switch (randInt(0, 2)) {
        case 0:
          content = faker.hacker.phrase();
          break;
        case 1:
          content = faker.commerce.productDescription();
          break;
        default:
          content = faker.lorem.lines();
          break;
      }

      content = truncate(content, 140);

      comments.push({
        user, room, content,
      });
    }
  });

  return comments;
}

function getFriendships({ users }: RefDependencies) {
  // No 2 Friendships should contain references to the same 2 Users!
  // Janky way of handling it is to iterate through users,
  // and only add users that haven't been iterated over yet
  const friendships = [];

  for (let i = 0; i < users.length - 1; i++) {
    const numFriendships = randInt(0, MAX_FRIENDSHIPS_PER_USER);
    const maxFriends = Math.min(users.length - i - 1, numFriendships);
    for (let j = 0; j < maxFriends; j++) {
      const status = ['PENDING', 'ACCEPTED', 'REJECTED'][randInt(0, 2)];
      const recipientIndex = randInt(1, users.length - 2 - i) + i;
      const recipient = users[recipientIndex]._id;

      friendships.push({
        recipient,
        status,
        requester: users[i]._id,
      });
    }
  }

  return friendships;
}

async function addRecordsToDB() {
  initializeMongoose();

  const users = getUsers();
  const rooms = getRooms({ users });
  const friendships = getFriendships({ users });
  const likes = getLikes({ users, rooms });
  const comments = getComments({ users, rooms });

  await Promise.all([
    User.create(users),
    Room.create(rooms),
    Like.create(likes),
    Comment.create(comments),
    Friendship.create(friendships),
  ]);

  mongoose.disconnect();
}

addRecordsToDB();
