import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const publicFolderPath = join(process.cwd(), "./public/img/movies");

const moviesJSONPath = join(dataFolderPath, "../api/movies/movies.json");
// console.log("Movies FOLDER PATH: ", moviesJSONPath);

export const getMovies = () => readJSON(moviesJSONPath);
export const writeMovies = (movieList) => writeJSON(moviesJSONPath, movieList);

export const saveMoviesAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(publicFolderPath, fileName), contentAsABuffer);
export const getPostJSONReadableStream = () => createReadStream(moviesJSONPath);
export const getPDFWritableStream = (filename) =>
  createReadStream(join(dataFolderPath, filename));
