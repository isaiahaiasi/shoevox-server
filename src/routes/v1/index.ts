import controllers from '../../controllers';
import { notImplementedHandler } from '../../middleware/errorHandlers';
import { getOpenApiRouter } from '../../utils/routeBuilder';

const router = getOpenApiRouter(controllers);

router.use('*', notImplementedHandler);

export default router;
