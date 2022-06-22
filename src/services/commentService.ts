import { HydratedDocument } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import spec from '../openapi.json';
import { getSchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { getPaginatedQuery, PaginationInfo } from '../utils/pagination';
import { userDtoFields } from './userService';

const commentDtoFields = getSchemaProperties(spec.components.schemas.Comment);

function getCommentDto(comment: HydratedDocument<IComment>) {
  const commentDto = serializeDocument(comment, commentDtoFields);
  commentDto.user = filterObject(commentDto.user, userDtoFields);
  return commentDto;
}

async function getCommentsByRoomId(roomid: string, limit: number, rawCursor?: any) {
  let cursor;
  if (rawCursor) {
    const [createdAt, id] = rawCursor.split(',');
    cursor = { createdAt, id };
  }

  const paginationInfo: PaginationInfo<any> = {
    limit,
    cursor: [
      {
        field: 'createdAt',
        value: cursor ? new Date(cursor.createdAt) : undefined,
        order: 'desc',
      },
      { field: '_id', value: cursor?.id },
    ],
  };

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
