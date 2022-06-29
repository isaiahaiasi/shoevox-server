import { components } from '@isaiahaiasi/voxelatlas-spec/schema.json';
import { HydratedDocument } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import { getSchemaProperties, SchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';
import { userDtoFields } from './userService';

const commentDtoFields = getSchemaProperties(components.schemas.Comment);
type CommentDto = SchemaProperties<'Comment'> & { createdAt: Date };

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
