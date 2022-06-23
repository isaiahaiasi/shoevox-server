import { HydratedDocument } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/pagination';
import { userDtoFields } from './userService';

// TODO: Afraid I'm going to have to write actual types for these...
const commentDtoFields = getSchemaProperties(spec.components.schemas.Comment);
type CommentDto = { [Property in typeof commentDtoFields[number] ]: any } & { createdAt: Date };

function getCommentDto(comment: HydratedDocument<IComment>): CommentDto {
  const commentDto = serializeDocument(comment, commentDtoFields);
  commentDto.user = filterObject(commentDto.user, userDtoFields);
  return commentDto as CommentDto;
}

async function getCommentsByRoomId(roomid: string, limit: number, rawCursor?: any) {
  const cursor = deserializeTimestampCursor(rawCursor);

  const paginationInfo: PaginationInfo<any> = { limit, cursor };

  const query = getPaginatedQuery(Comment, paginationInfo, { room: roomid });

  const comments = await query
    .select(commentDtoFields.join(' '))
    .populate('user')
    .exec();

  return comments.map(getCommentDto);
}

export default {
  getCommentsByRoomId,
};
