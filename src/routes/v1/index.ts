import controllers from '../../controllers';
import { notImplementedHandler } from '../../middleware/errorHandlers';
import { getOpenApiRouter } from '../../utils/routeBuilder';

const API_DATA_PATH = '../../spec/openapi.yaml';

const router = getOpenApiRouter(API_DATA_PATH, controllers);

router.use('*', notImplementedHandler);

// Optionally, could load a second list of routes conditionally.
// Eg, a devRoutes list with API documentation if NODE_ENV == 'development'

export default router;
