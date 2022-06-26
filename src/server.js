const express = require("express");
const cors = require("cors");
const connectDB = require("./api/libs/db");

const app = express();
const bodyParser = require("body-parser");
const config = require("./api/config");

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  // optionSuccessStatus: 200,
};

//middleware
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// my middleware
const Admin = require("./api/routes/admin");
const Agent = require("./api/routes/agents");
const Customers = require("./api/routes/customers");
const Interested = require("./api/routes/intrested");
const Login = require("./api/routes/login");
const Property = require("./api/routes/propperty");
const UpImage = require("./api/routes/uploadImages");

// end points
app.use("/api/admin", Admin);
app.use("/api/agent", Agent);
app.use("/api/customers", Customers);
app.use("/api/requests", Interested);
app.use("/api/signin", Login);
app.use("/api/properties", Property);
app.use("/api/upload", UpImage);

app.get("/", (req, res) => {
  res.send("Hello Welcome to real estate api! written by prince");
});

// mongoose database connection
connectDB();

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
