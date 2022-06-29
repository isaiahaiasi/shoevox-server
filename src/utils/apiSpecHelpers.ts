import { components } from '@isaiahaiasi/voxelatlas-spec/schema.json';
import { FilterConditionally } from './typeHelpers';

type ObjectSchema = FilterConditionally<typeof components.schemas, { properties: any }>;
type ObjectSchemaName = keyof ObjectSchema;

/** Type helper for spec component schemas */
export type SchemaProperties<T extends ObjectSchemaName> = ObjectSchema[T]['properties'];

/** Convert path string from OpenAPI style to Express style
 * @example "/users/{userid}" => "/users/:userid"
 */
function convertParamStyle(path: string) {
  return path.replace(/\{.*?\}/g, (param) => `:${param.slice(1, -1)}`);
}

/** Strip 'parameters' property so path object only contains methods */
export function getMethodsFromPath(path: any) {
  const { parameters, ...pathData } = path;
  return pathData;
}

/** Returns the paths object where each path just has its methods, no parameters */
export function getCleanPathsObject(paths: any) {
  const mappedEntries = Object
    .entries(paths)
    .map(([pathName, pathData]) => ([convertParamStyle(pathName), getMethodsFromPath(pathData)]));
  return Object.fromEntries(mappedEntries);
}

export function getSchemaProperties<T extends { properties: any }>(schemaObj: T) {
  return Object.keys(schemaObj.properties) as (keyof T['properties'])[];
}
