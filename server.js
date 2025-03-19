const express = require("express")
const cors = require('cors')
const bodyParser = require("body-parser")
require('dotenv').config();
const session = require("express-session");
const fileUpload = require("express-fileupload")
const path = require("path");
const http = require("http");
const { Server } = require('socket.io')

// ------------------

const connect_to_db = require("./config/db")
const { auth_token } = require('./config/middlewares');
const { socketEvents } = require("./socket");
const { getSearch } = require("./Controllers/SearchController");

// -------------------



const app = express();
connect_to_db();


// ----------

const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL
const io = new Server(server, {
    cors: ["http://localhost:3000", FRONTEND_URL]
});


io.on('connection', (socket) => socketEvents(socket, io))

// -----------  --
app.use(cors({
    origin: ["http://localhost:3000", FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
}))

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(bodyParser.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))


app.use(fileUpload());


// -----------------

app.get('/', (req, res) => {
    res.send({ "Younite-backend : ": "welcome !" })
})
app.get('/token_authenticate', auth_token, (req, res) => {
    return res.status(200).json({ message: "cookie valide" })
})


// ----------- Routes  => 

app.use(require('./routes/user_routes'))
app.use("/post", require('./routes/posts_routes'))
app.use("/reels", require('./routes/reels_routes'))
app.use("/blog", require('./routes/blogs_routes'))
app.use("/interaction", require('./routes/interaction_routes'))
app.use("/moments", require('./routes/moments_routes'))
app.use("/profile", require('./routes/profile_routes'))
app.use("/shares", require('./routes/shares_routes'))
app.use("/social_action", require('./routes/SocialUser_routes'))

// -----------
app.get('/search/', getSearch)

// 

server.listen(5000, "0.0.0.0", e => {
    console.log('server is running');

})

module.exports = { io }