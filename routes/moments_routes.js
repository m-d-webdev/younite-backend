const express = require('express');
const {auth_token} = require('../config/middlewares');
const { get_moment_interaction } = require("../Controllers/moment_controller")

const router = express.Router()

router.get("/get_interaction", auth_token, get_moment_interaction);

module.exports = router