const express = require('express');
const { Store_socila_NewUser, Login_socila_user } = require('../Controllers/social_actions/auth_social_users');

const Router = express.Router()

Router.post("/create", Store_socila_NewUser)
Router.post("/login", Login_socila_user)

module.exports = Router