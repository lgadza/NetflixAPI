import express, { response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
// import { getMovies } from "../../lib/fs-tools";
import { sendRegistrationEmail } from "../../lib/email-tools.js";
import { checksMovieSchema, triggerBadRequest } from "./validator.js";

const moviesJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "movies.json"
);
console.log("New****************", moviesJSONPath);

const moviesRouter = express.Router();

moviesRouter.post("/", checksMovieSchema, triggerBadRequest, (req, res) => {
  console.log(req.body);
  const newMovie = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uniqid(),
    // avatar: `https://ui-avatars.com/api/?name=${req.body.name}`,
  };
  const moviesList = JSON.parse(fs.readFileSync(moviesJSONPath));
  moviesList.push(newMovie);
  fs.writeFileSync(moviesJSONPath, JSON.stringify(moviesList));
  res.status(201).send({ id: newMovie.id });
});
moviesRouter.get("/", (req, res) => {
  const moviesList = fs.readFileSync(moviesJSONPath);
  console.log("movielist:", moviesList);
  const movies = JSON.parse(moviesList);
  res.send(movies);
});
moviesRouter.get("/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  const movielist = JSON.parse(fs.readFileSync(moviesJSONPath));
  const foundMovie = movielist.find((movie) => movie.id === movieId);
  res.send(foundMovie);
});
moviesRouter.put("/:movieId", (req, res) => {
  console.log(req.body);
  const movieList = JSON.parse(fs.readFileSync(moviesJSONPath));
  const index = movieList.findIndex((movie) => movie.id === req.params.movieId);
  const oldMovieData = movieList[index];
  const updatedMovie = {
    ...oldMovieData,
    ...req.body,
    updatedAt: new Date(),
  };
  movieList[index] = updatedMovie;
  fs.writeFileSync(moviesJSONPath, JSON.stringify(movieList));
  res.send(updatedMovie);
});
moviesRouter.delete("/:movieId", (req, res) => {
  const movieList = JSON.parse(fs.readFileSync(moviesJSONPath));
  const remainMovies = movieList.filter(
    (movie) => movie.id !== req.params.movieId
  );
  fs.writeFileSync(moviesJSONPath, JSON.stringify(remainMovies));
  res.status(204).send();
});

moviesRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);
    await sendRegistrationEmail(email);
    res.send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});
export default moviesRouter;
