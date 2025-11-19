import express from "express";

import {
  createShortQuestion,
  getShortQuestions,
  getShortQuestion,
  updateShortQuestion,
  deleteShortQuestion,
  getPaginatedShortQuestions,
  bulkCreateShortQuestions
} from "../../controllers/shortQuestion.controller";

const router = express.Router();

router.get("/paginated", getPaginatedShortQuestions);
router.post("/bulk", bulkCreateShortQuestions);

router.post("/", createShortQuestion);
router.get("/", getShortQuestions);
router.get("/:id", getShortQuestion);
router.put("/:id", updateShortQuestion);
router.delete("/:id", deleteShortQuestion);

export default router;
