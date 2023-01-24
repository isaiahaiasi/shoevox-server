// TODO
export type ApiResponseLinks = any;

export type FilterConditionally<T, Condition> = Pick<
T, { [K in keyof T]: T[K] extends Condition ? K : never }[keyof T]
>;
