import schema from '@isaiahaiasi/voxelatlas-spec/schema.json';
import { validators } from '../../middleware/validators';

describe('Validators conform to OpenAPI Schema', () => {
  test('A Validator exists for every property of every RequestBody', () => {
    Object.entries(schema.components.requestBodies).forEach(([bodyName, requestBody]) => {
      const bodyProperties = requestBody.content['application/json'].schema.properties;

      // TODO: Figure out types
      // @ts-ignore
      expect(validators[bodyName]).not.toBeUndefined();

      Object.keys(bodyProperties).forEach((bodyProperty) => {
        // @ts-ignore
        expect(validators[bodyName][bodyProperty]).not.toBeUndefined();
      });
    });
  });
});
