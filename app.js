if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

// DATABASE CONNECTION
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// MIDDLEWARES
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

// SESSION STORE
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH + CURRENT USER
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ROUTES
app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

// 404 ERROR
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).render("error.ejs", { message });
});

// SERVER
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});