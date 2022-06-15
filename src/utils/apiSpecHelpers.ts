import fs from 'fs';
import nodePath from 'path';
import YAML from 'yaml';

/** Convert path string from OpenAPI style to Express style
 * @example "/users/{userid}" => "/users/:userid"
 */
function convertParamStyle(path: string) {
  return path.replace(/\{.*?\}/g, (param) => `:${param.slice(1, -1)}`);
}

export function getOpenApiData(apiDataPath: string) {
  const file = fs.readFileSync(nodePath.join(__dirname, apiDataPath), 'utf-8');
  return YAML.parse(file);
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
