import controllers from '../../controllers';
import { notImplementedHandler } from '../../middleware/errorHandlers';
import { getOpenApiRouter } from '../../utils/routeBuilder';
import authRouter from './auth';

const router = getOpenApiRouter(controllers);

router.use('/auth', authRouter);

router.use('*', notImplementedHandler);

export default router;
