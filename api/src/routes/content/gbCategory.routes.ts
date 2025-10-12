import { Router } from 'express';
import * as gbCategoryController from '../../controllers/content/gbCategory.controller';

const router = Router();

// GB Category routes
router.post('/', gbCategoryController.createGBCategory);
router.post('/bulk', gbCategoryController.bulkCreateGBCategories);
router.get('/', gbCategoryController.getGBCategories);
router.get('/:id', gbCategoryController.getGBCategory);
router.put('/:id', gbCategoryController.updateGBCategory);
router.delete('/:id', gbCategoryController.deleteGBCategory);

export default router;
