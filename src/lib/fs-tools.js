import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const publicFolderPath = join(process.cwd(), "./public/img/movies");

console.log("ROOT OF THE PROJECT:", process.cwd());
console.log("PUBLIC FOLDER:", publicFolderPath);

const moviesJSONPath = join(dataFolderPath, "movies.json");
console.log("autors FOLDER PATH: ", moviesJSONPath);

export const getMovies = () => readJSON(moviesJSONPath);
export const writeMovies = (movieList) => writeJSON(moviesJSONPath, movieList);

export const saveMoviesAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(publicFolderPath, fileName), contentAsABuffer);
export const getPostJSONReadableStream = () => createReadStream(moviesJSONPath);
export const getPDFWritableStream = (filename) =>
  createReadStream(join(dataFolderPath, filename));
