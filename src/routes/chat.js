const express = require("express")
const router = express.Router();
const { chat } = require("../controllers/chatController")
const auth = require("../middleware/auth")

router.use(auth);

// Chat route
router.post("/", chat);

module.exports = router;