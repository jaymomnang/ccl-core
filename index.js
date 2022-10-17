/*global process*/
import 'dotenv/config';
import MongoClient from "mongodb";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

//routes and models
import routes from "./routes/_routes.js";
import courses from "./models/coursesModel.js";
import settings from "./models/AppSettingModel.js";
import users from "./models/usersModel.js";

const app = express();

app.use(cors());
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 7100;
// Register api routes
app.use("/", routes);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

MongoClient.connect(
  process.env.DB_URI,  
  // TODO: Connection Pooling
  // Set the poolSize to 50 connections.
  // TODO: Timeouts
  // Set the write timeout limit to 2500 milliseconds.
  { useNewUrlParser: true, poolSize: 50, wtimeout: 2500, useUnifiedTopology: true }
)
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async client => {
    await courses.injectDB(client)
    await settings.injectDB(client)
    await users.injectDB(client)

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
    
  });
