const path = require("path");
const express = require("express");
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const expressHbs = require("express-handlebars");
const flash = require("connect-flash");
const multer = require("multer");

const sequelize = require("./utils/database/dbconfig");
const models = require("./models/indexModel");
const User = models.userModel;
const app = express();

const store = new SequelizeStore({
  db: sequelize,
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const fileName = `${new Date().toISOString()}-${file.originalname}`
      .trim()
      .replace(/:/g, "-");
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


const hbs = expressHbs.create({});
hbs.handlebars.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return options.fn ? options.fn(this) : "";
  } else {
    return options.inverse ? options.inverse(this) : "";
  }
});

app.engine(
  "hbs",
  expressHbs.engine({
    layoutsDir: "views/layouts/",
    defaultLayout: "main",
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// Router Import
const indexRoutes = require("./routes/indexRoutes");


app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use((req, res, next) => {
  // req.Token = AuthHelper.generateToken(req.user);
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
    "Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Routes
app.use(indexRoutes);

// Error Handler
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Server Running
sequelize
  .sync() // { force: true }
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
