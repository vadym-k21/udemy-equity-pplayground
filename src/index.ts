import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./db_config";
import companiesRouter from "./routes/companies";
import shareholdersRouter from "./routes/shareholders";

const app = express();

app.use(bodyParser.json());
app.use(cors());

// add companies and shareholders routes
app.use("/api/v1/companies", companiesRouter);
app.use("/api/v1/shareholders", shareholdersRouter);

app.listen(3000, async () => {
  console.log("Server is running on port 3000");

  await connectDB();
});
