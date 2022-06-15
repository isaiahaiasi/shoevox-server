import json from '../../openapi.json';
import { getMethodsFromPath } from '../../utils/apiSpecHelpers';

const opd = json as any;

describe('OpenAPI description for ShoeVox', () => {
  test('every endpoint has an operationId', () => {
    Object.keys(opd.paths).forEach((apiPath) => {
      const methodData = getMethodsFromPath(opd.paths[apiPath]);
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

      Object.entries(getMethodsFromPath(opd.paths[pathName]))
        .forEach(([, v]) => {
          expect((v as any).responses['404']).not.toBeUndefined();
        });
    });
  });

  test('every endpoint with requestBody handles 400 INVALID VALUE error', () => {
    Object.entries(opd.paths).forEach(([pathName]) => {
      Object.values(getMethodsFromPath(opd.paths[pathName]))
        .filter((method: any) => !!method.requestBody)
        .forEach((v: any) => {
          expect(v.responses['400']).not.toBeUndefined();
        });
    });
  });
});
