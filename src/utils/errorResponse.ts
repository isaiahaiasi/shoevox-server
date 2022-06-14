// TODO: proper typing
type ResponseError = any;

export function createErrorResponse(err: ResponseError) {
  return err;
}
