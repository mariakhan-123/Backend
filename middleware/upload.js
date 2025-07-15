// middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // use memory, not disk

const upload = multer({ storage });

module.exports = upload;
