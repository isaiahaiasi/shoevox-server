import { components } from '@isaiahaiasi/voxelatlas-spec/schema.json';
import { HydratedDocument } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import { userDtoFields } from '../types/dtos';
import { getSchemaProperties, SchemaProperties } from '../utils/apiSpecHelpers';
import { filterObject, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, getPaginatedQuery, PaginationInfo } from '../utils/paginationHelpers';

const commentDtoFields = getSchemaProperties(components.schemas.Comment);
type CommentDto = SchemaProperties<'Comment'> & { createdAt: Date };

type RequiredCommentInputs = {
  room: string,
  user: string,
  content: string,
};

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

async function createComment({ room, user, content }: RequiredCommentInputs) {
  const comment = await new Comment({ room, content, user })
    .save()
    .then((res) => res.populate('user'));

  return getCommentDto(comment);
}

async function deleteComment(commentId: string, userId: string) {
  // TODO: not a fan of implicit authorization
  const deletedComment = await Comment.findOneAndDelete({ _id: commentId, user: userId });

  if (!deletedComment) {
    throw Error(`Could not find Comment with id ${commentId} to delete!`);
  }

  return getCommentDto(deletedComment);
}

export default {
  createComment,
  deleteComment,
  getCommentsByRoomId,
};
