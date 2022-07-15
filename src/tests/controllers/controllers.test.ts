import spec from '@isaiahaiasi/voxelatlas-spec/schema.json';
import controllers from '../../controllers';

describe('General controllers tests', () => {
  test('All exported controllers exist in OpenAPI schema', () => {
    const operationIds: any = {};

    Object.values(spec.paths).forEach((path) => {
      Object.values(path).forEach((method) => {
        if (method.operationId) {
          operationIds[method.operationId] = true;
        }
      });
    });

    Object.keys(controllers).forEach((controllerKey) => {
      expect(operationIds[controllerKey]).toBe(true);
    });
  });
});
