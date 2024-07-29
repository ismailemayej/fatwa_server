const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getRecentPosts,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  searchQuestions,
  getTrending,
  getSingleTrending,
} = require("../controllers/questionController");

const router = express.Router();

router.post("/", createQuestion);
router.get("/", getAllQuestions);
router.get("/recent-posts", getRecentPosts);
router.get("/:qn", getSingleQuestion);
router.put("/:qn", updateQuestion);
router.delete("/:qn", deleteQuestion);
router.get("/search", searchQuestions);
router.get("/trending", getTrending);
router.get("/trending/:qn", getSingleTrending);
module.exports = router;
