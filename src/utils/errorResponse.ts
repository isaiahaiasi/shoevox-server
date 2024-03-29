import { HttpMethod } from '@isaiahaiasi/voxelatlas-spec/public/commonTypes';

interface NotImplementedErrorParams {
  method: Uppercase<HttpMethod>;
  originalUrl: string;
}

interface ResourceNotFoundErrorParams {
  originalUrl: string;
  idName: string;
  id?: string;
}

interface GenericServerErrorParams {
  method: Uppercase<HttpMethod>;
  idName: string;
  id?: string;
}

export function createNotImplementedError({ method, originalUrl }: NotImplementedErrorParams) {
  return new Error(`${method} ${originalUrl} has not been implemented yet!`);
}

export function createResourceNotFoundError(
  { originalUrl, id, idName }: ResourceNotFoundErrorParams,
) {
  return new Error(`Could not find ${idName} "${id}" at ${originalUrl}`);
}

export function createGenericServerError(
  { method, idName, id }: GenericServerErrorParams,
) {
  const msg = id
    ? `Could not ${method} ${idName} ${id}`
    : `Could not ${method} ${idName}`;

  return new Error(msg);
}

// TODO: proper typing
export function createErrorResponse(err: any) {
  return err;
}
