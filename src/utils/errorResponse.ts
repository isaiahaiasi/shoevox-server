import { MethodUppercase } from './typeHelpers';

interface NotImplementedErrorParams {
  method: MethodUppercase ;
  fullPath: string;
}

interface ResourceNotFoundErrorParams {
  fullPath: string;
  resource: string;
  identifier: string;
}

interface GenericServerErrorParams {
  method: MethodUppercase;
  resource: string;
  identifier?: string;
}

export function createNotImplementedError({ method, fullPath }: NotImplementedErrorParams) {
  return { status: 501, msg: `${method}${fullPath} has not been implemented yet!` };
}

export function createResourceNotFoundError(
  { fullPath, resource, identifier }: ResourceNotFoundErrorParams,
) {
  return { status: 404, msg: `Could not find ${resource} ${identifier} at ${fullPath}` };
}

export function createGenericServerError(
  { method, resource, identifier }: GenericServerErrorParams,
) {
  const msg = identifier
    ? `Could not ${method} ${resource} ${identifier}`
    : `Could not ${method} ${resource}`;

  return { status: 500, msg };
}

// TODO: proper typing
export function createErrorResponse(err: any) {
  return err;
}
