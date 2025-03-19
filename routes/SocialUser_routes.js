const express = require('express');
const { Store_socila_NewUser, Login_socila_user, get_firebase_keys } = require('../Controllers/social_actions/auth_social_users');

const Router = express.Router()

Router.post("/create", Store_socila_NewUser)
Router.post("/login", Login_socila_user)
Router.get("/get_firebase_keys", get_firebase_keys)

module.exports = Router