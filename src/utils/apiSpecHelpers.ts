import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export function getOpenApiData(apiDataPath: string) {
  const file = fs.readFileSync(path.join(__dirname, apiDataPath), 'utf-8');
  return YAML.parse(file);
}

/** Strip 'parameters' property so path object only contains methods */
export function getMethodsFromPath(apiPath: any) {
  const { parameters, ...pathData } = apiPath;
  return pathData;
}

/** Returns the paths object where each path just has its methods, no parameters */
export function stripParametersFromPathsObject(paths: any) {
  const mappedEntries = Object
    .entries(paths)
    .map(([pathName, pathData]) => ([pathName, getMethodsFromPath(pathData)]));
  return Object.fromEntries(mappedEntries);
}
