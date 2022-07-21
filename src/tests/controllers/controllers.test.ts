import { apiSpec } from '@isaiahaiasi/voxelatlas-spec';
import controllers from '../../controllers';

describe('General controllers tests', () => {
  test('All exported controllers exist in OpenAPI schema', () => {
    const operationIds: any = {};

    Object.values(apiSpec.paths).forEach((path) => {
      Object.values(path).forEach((method) => {
        if (method.operationId) {
          operationIds[method.operationId] = true;
        }
      });
    });

    Object.keys(controllers).forEach((controllerKey) => {
      const controller = operationIds[controllerKey];
      expect(controller).toBe(true);
    });
  });
});
