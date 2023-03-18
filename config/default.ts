import dotenv from "dotenv";
dotenv.config();

// Load
const port = 3001;
const jwt_secret = process.env.JWT_SECRET;
const env = process.env.ENV;

// Validate
if (jwt_secret === undefined || jwt_secret.length === 0) {
  throw Error("JWT_SECRET is invalid");
}
if (env === undefined || !["dev", "prod", "test"].includes(env)) {
  throw Error("ENV is invalid");
}

// Export
export { env, port, jwt_secret };
