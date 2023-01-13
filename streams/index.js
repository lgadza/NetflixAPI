import request from "request";
import { pipeline } from "stream"; // CORE MODULE
import fs from "fs-extra";
import { join } from "path";

const url = "https://skimdb.npmjs.com/registry/_changes?include_docs=true";

const source = request.get("http://parrot.live");
const destination = process.stdout;

pipeline(source, destination, (err) => {
  if (err) console.log(err);
  else console.log("STREAM ENDED SUCCESSFULLY!");
});
