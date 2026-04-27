const router = require("express").Router();
const upload = require("../middlewares/upload");
const { verifyToken } = require("../middlewares/authetication");
const { allowRoles } = require("../middlewares/role");

const { uploadContent } = require("../controllers/content");
const { getLive } = require("../controllers/content");
const { publicLimiter } = require("../middlewares/rateLimiter");

router.post(
  "/upload",
  verifyToken,
  allowRoles("TEACHER"),
  upload.single("file"),
  uploadContent
);

router.get("/live/:teacherId",  publicLimiter, getLive);

module.exports = router;