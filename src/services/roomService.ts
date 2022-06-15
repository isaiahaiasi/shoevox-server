import Room from '../models/Room';
import { serializeDocument, serializeDocuments } from '../utils/mongooseHelpers';

const PUBLIC_ROOM_FIELDS = 'title createdAt creator url';

// TODO: Need a special serializer to deal with "populated" fields
const getRooms = async () => {
  const rooms = await Room.find({}).select(PUBLIC_ROOM_FIELDS).populate('creator', 'username').exec();
  return serializeDocuments(rooms);
};

const getRoomById = async (id: string) => {
  const room = await Room.findById(id).select(PUBLIC_ROOM_FIELDS).exec();

  if (!room) {
    return null;
  }

  return serializeDocument(room);
};

export default {
  getRooms,
  getRoomById,
};
