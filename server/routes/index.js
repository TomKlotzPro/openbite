const express = require("express");
const app = express();
const session = require("express-session");
const db = require("../db");
const algolia = require("../algolia");

const bodyParser = require("body-parser");
const keys = require("../keys");
const passport = require("passport");
const cors = require("cors")

const usersRoutes = require("./user");
const productRoutes = require("./product");
const categoryRoutes = require("./category");
const blogRoutes = require("./blog");
const apiRoutes = require("./api");
const upvoteRoutes = require("./upvote");
const subscribeRoutes = require("./subscribe");

require("../services/passport");

db.connect();

const store = db.initSessionStore();
algolia.initSyncWithAlgolia();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const sess = {
  name: "openetwork-secure-session",
  secret: keys.SESSION_SECRET,
  cookie: { maxAge: 2 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: false,
  store
};

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  sess.cookie.secure = true;
  sess.cookie.httpOnly = true;
  sess.cookie.sameSite = true;
  sess.cookie.domain = process.env.DOMAIN; // .yourdomain.com
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

app.use("", apiRoutes);
app.use("/users", usersRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/blogs", blogRoutes);
app.use("/upvotes", upvoteRoutes);
app.use("/subscribe", subscribeRoutes);


module.exports = {
  path: "/api/v1",
  handler: app
};
