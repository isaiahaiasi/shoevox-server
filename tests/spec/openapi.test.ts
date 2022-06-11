import YAML from 'yaml';
import fs from 'fs';
import path from 'path';

const apiFileLocation = '../../spec/openapi.yaml';

const file = fs.readFileSync(path.join(__dirname, apiFileLocation), 'utf-8');
const opd = YAML.parse(file);

// If I define parameters on the path rather than the endpoint
// (which, of course I do!)
// It's convenient to strip that from my "methods" object.
function getMethodsFromPath(apiPath: string) {
  const { parameters, ...pathData } = opd.paths[apiPath];
  return pathData;
}

describe('OpenAPI description for ShoeVox', () => {
  test('every endpoint has an operationId', () => {
    Object.keys(opd.paths).forEach((apiPath) => {
      const methodData = getMethodsFromPath(apiPath);
      Object.values(methodData).forEach((v: any) => {
        expect(v.operationId).not.toBeUndefined();
      });
    });
  });

  test('every required property of a schema is defined on the schema', () => {
    Object.values(opd.components.schemas).forEach((schema: any) => {
      if (schema.type === 'object') {
        schema.required.forEach((requiredPropName: string) => {
          expect(schema.properties[requiredPropName]).not.toBeUndefined();
        });
      }
    });
  });

  test('every GET request with parameters handles 404 NOT FOUND response', () => {
    Object.entries(opd.paths).forEach(([pathName, pathData]) => {
      if (!(pathData as any).parameters) {
        return;
      }

      Object.entries(getMethodsFromPath(pathName))
        .forEach(([, v]) => {
          expect((v as any).responses['404']).not.toBeUndefined();
        });
    });
  });

  test('every endpoint with requestBody handles 400 INVALID VALUE error', () => {
    Object.entries(opd.paths).forEach(([pathName]) => {
      Object.values(getMethodsFromPath(pathName))
        .filter((method: any) => !!method.requestBody)
        .forEach((v: any) => {
          expect(v.responses['400']).not.toBeUndefined();
        });
    });
  });
});
