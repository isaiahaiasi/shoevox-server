import { Dto, dtoFields } from '@isaiahaiasi/voxelatlas-spec';
import { HydratedDocument } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import { filterObject, getPaginatedQuery, serializeDocument } from '../utils/mongooseHelpers';
import { deserializeTimestampCursor, PaginationInfo, RawPaginationInfo } from '../utils/paginationHelpers';

type RequiredCommentInputs = {
  room: string,
  user: string,
  content: string,
};

function getCommentDto(comment: HydratedDocument<IComment>) {
  const commentDto = serializeDocument(comment, dtoFields.comment);
  commentDto.user = filterObject(commentDto.user, dtoFields.user);
  return commentDto as Dto['Comment'];
}

async function getCommentsByRoomId(
  roomid: string,
  { limit, cursor: rawCursor }: RawPaginationInfo,
) {
  const cursor = deserializeTimestampCursor(rawCursor);

  const paginationInfo: PaginationInfo<IComment> = { limit, cursor };

  const query = getPaginatedQuery(Comment, paginationInfo, { room: roomid });

  const comments = await query
    .select(dtoFields.comment.join(' '))
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
