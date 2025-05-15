const express = require("express");
const router = express.Router();
const { getUsers, deleteUser, updateUser } = require("../Controllers/user");
const { auth, isAdmin } = require("../Middleware/auth");

router.get("/users", auth, isAdmin, getUsers);
router.put("/user/:id", auth, isAdmin, updateUser);
router.delete("/user/:id", auth, isAdmin, deleteUser);

module.exports = router;
