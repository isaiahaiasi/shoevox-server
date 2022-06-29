// Methods supported by OpenAPI 3.0
// ('connect' is NOT a supported method)
export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'trace';
export type MethodUppercase = `${Uppercase<Method>}`;
export type ApiResponseLinks = any;
export type FilterConditionally<T, Condition> = Pick<
T, { [K in keyof T]: T[K] extends Condition ? K : never }[keyof T]
>;
