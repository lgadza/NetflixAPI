import express, { response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { getMovies, writeMovies } from "../../lib/fs-tools.js";
import { sendRegistrationEmail } from "../../lib/email-tools.js";
import { checksMovieSchema, triggerBadRequest } from "./validator.js";

const moviesJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "movies.json"
);
console.log("New****************", await getMovies());

const moviesRouter = express.Router();

moviesRouter.post(
  "/",
  checksMovieSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newMovie = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        imdbID: uniqid(),
      };
      console.log(req.body);
      // const moviesList = JSON.parse(fs.readFileSync(moviesJSONPath));
      const moviesList = await getMovies();
      moviesList.push(newMovie);
      // fs.writeFileSync(moviesJSONPath, JSON.stringify(moviesList));
      await writeMovies(moviesList);
      res.status(201).send({ imdbID: newMovie.imdbID });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
moviesRouter.get("/", (req, res, next) => {
  try {
    const moviesList = fs.readFileSync(moviesJSONPath);
    console.log("movielist:", moviesList);
    const movies = JSON.parse(moviesList);
    res.send(movies);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.get("/:movieImdbID", (req, res, next) => {
  try {
    const movieImdbID = req.params.movieImdbID;
    const movielist = JSON.parse(fs.readFileSync(moviesJSONPath));
    const foundMovie = movielist.find((movie) => movie.imdbID === movieImdbID);
    res.send(foundMovie);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.put("/:movieImdbID", (req, res, next) => {
  try {
    console.log(req.body);
    const movieList = JSON.parse(fs.readFileSync(moviesJSONPath));
    const index = movieList.findIndex(
      (movie) => movie.imdbID === req.params.movieImdbID
    );
    const oldMovieData = movieList[index];
    const updatedMovie = {
      ...oldMovieData,
      ...req.body,
      updatedAt: new Date(),
    };
    movieList[index] = updatedMovie;
    fs.writeFileSync(moviesJSONPath, JSON.stringify(movieList));
    res.send(updatedMovie);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.delete("/:movieImdbID", (req, res, next) => {
  try {
    const movieList = JSON.parse(fs.readFileSync(moviesJSONPath));
    const remainMovies = movieList.filter(
      (movie) => movie.imdbID !== req.params.movieImdbID
    );
    fs.writeFileSync(moviesJSONPath, JSON.stringify(remainMovies));
    res.status(204).send();
  } catch (error) {
    console.log(error);
    next(error);
  }
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
