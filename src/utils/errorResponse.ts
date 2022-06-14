interface NotImplementedErrorParams {
  method: string;
  fullPath: string;
}

export function createNotImplementedError({ method, fullPath }: NotImplementedErrorParams) {
  return { status: 501, msg: `${method}${fullPath} has not been implemented yet!` };
}

// TODO: proper typing
export function createErrorResponse(err: any) {
  return err;
}
