import config from "config";
import app from "./app";

const port = config.get("port");

app.listen(port, function () {
  console.log(`Starting app on port: ${port}`);
});
