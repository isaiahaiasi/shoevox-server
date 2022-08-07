import { Router } from 'express';
import {
  getCurrentUser, handleLoginFailure, handleProvider, handleProviderRedirect,
} from '../../controllers/authController';

const router = Router();

router.get('/current', getCurrentUser);

router.get('/providers/:provider', handleProvider);

router.get('/providers/:provider/redirect', handleProviderRedirect);

// I don't really like that this is its own route,
// but passport's failureRedirect makes this the easy option.
router.get('/login/failure', handleLoginFailure);

export default router;
