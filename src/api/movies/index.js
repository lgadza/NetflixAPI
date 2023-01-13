import express, { response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { getMovies, writeMovies } from "../../lib/fs-tools.js";
// import { sendRegistrationEmail } from "../../lib/email-tools.js";
import { checksMovieSchema, triggerBadRequest } from "./validator.js";
import httpErrors from "http-errors";

const { NotFound, Unauthorised, BadRequest } = httpErrors;
const moviesJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "movies.json"
);

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

      const moviesList = await getMovies();
      moviesList.push(newMovie);

      await writeMovies(moviesList);
      res.status(201).send({ imdbID: newMovie.imdbID });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
moviesRouter.get("/", async (req, res, next) => {
  try {
    // const moviesList = fs.readFileSync(moviesJSONPath);
    const moviesList = await getMovies(moviesJSONPath);
    console.log("movielist:", moviesList);
    // const movies = JSON.parse(moviesList);
    res.send(moviesList);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.get("/:movieImdbID", async (req, res, next) => {
  try {
    const movieImdbID = req.params.movieImdbID;
    const movielist = await getMovies(moviesJSONPath);
    const foundMovie = movielist.find((movie) => movie.imdbID === movieImdbID);
    if (foundMovie) {
      res.send(foundMovie);
    } else {
      next(NotFound(`Movie id ${req.params.movieImdbID} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.put("/:movieImdbID", async (req, res, next) => {
  try {
    console.log(req.body);
    const movieList = await getMovies(moviesJSONPath);
    const index = movieList.findIndex(
      (movie) => movie.imdbID === req.params.movieImdbID
    );
    if (index !== -1) {
      const oldMovieData = movieList[index];
      const updatedMovie = {
        ...oldMovieData,
        ...req.body,
        updatedAt: new Date(),
      };
      movieList[index] = updatedMovie;
      writeMovies(movieList);
      res.send(updatedMovie);
    } else {
      next(NotFound(`Movie with id ${req.params.movieImdbID} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
moviesRouter.delete("/:movieImdbID", async (req, res, next) => {
  try {
    const movieList = await getMovies(moviesJSONPath);
    const remainMovies = movieList.filter(
      (movie) => movie.imdbID !== req.params.movieImdbID
    );
    writeMovies(remainMovies);
    if (movieList.length !== remainMovies.length) {
      writeMovies(remainMovies);
      res.status(204).send();
    } else {
      next(NotFound(`Movie with id ${req.params.movieImdbID} not found :(`));
    }
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
