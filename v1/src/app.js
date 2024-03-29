const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/index");
const loaders = require("./loaders/index");
const { userRoutes, postRoutes } = require("./api-routes");
const errorHandler = require("./middlewares/error-handler.middleware");
const ApiError = require("./responses/error.response");
const httpStatus = require("http-status");
const path = require("path");
const swaggerUI = require("swagger-ui-express");
swaggerDocument = require("../../swagger.json");

config();
loaders();

const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "./", "uploads")));
app.use(helmet());
app.use(cors());
app.use(fileUpload());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.use((req, res, next) => {
  next(new ApiError("Endpoint not found. Please enter valid enpoint", httpStatus.BAD_REQUEST));
});

app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log(`SERVER ${process.env.PORT} is running`);
});
