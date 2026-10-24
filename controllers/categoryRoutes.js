import express from 'express';
import {
    getCategories,
    createCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// NOTE: You should add your authentication middleware here to protect these routes.
// For example: import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getCategories).post(/* protect, admin, */ createCategory);

export default router;