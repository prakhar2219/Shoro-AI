import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Rutas protegidas
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Rutas de administrador
router.use(restrictTo('admin'));
router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
