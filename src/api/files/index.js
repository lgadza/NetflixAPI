import express from "express";
import multer from "multer";
import { extname } from "path";
import json2csv from "json2csv";
import httpErrors from "http-errors";
// *********this is local not when hosted online******************
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// ************************************************

const { NotFound, Unauthorised, BadRequest } = httpErrors;
const moviesJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "movies.json"
);

import {
  saveMoviesPoster,
  getMovies,
  writeMovies,
} from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getMovieJSONReadableStream } from "../../lib/fs-tools.js";
import { pipeline } from "stream";
import { createGzip } from "zlib";
import {
  asyncPDFGeneration,
  getPDFReadableStream,
} from "../../lib/pdf-tools.js";

const filesRouter = express.Router();
const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "img/covers",
    },
  }),
}).single("cover");

filesRouter.post(
  "/:movieImdbID/poster",
  multer().single("cover"),
  // cloudinaryUploader,
  async (req, res, next) => {
    try {
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.movieImdbID + originalFileExtension;

      await saveMoviesPoster(fileName, req.file.buffer);

      const url = `http://localhost:3001/img/movies/${fileName}`;

      const movies = await getMovies();

      const index = movies.findIndex(
        (movie) => movie.imdbID === req.params.movieImdbID
      );

      if (index !== -1) {
        const oldMovie = movies[index];

        const Poster = url;
        const updatedMovie = { ...oldMovie, Poster, updatedAt: new Date() };

        movies[index] = updatedMovie;

        await writeMovies(movies);
      }

      res.send("File uploaded");
    } catch (error) {
      next(error);
    }
  }
);
filesRouter.get("/:movieImdbID/pdf", async (req, res, next) => {
  console.log("firing", req.params.movieImdbID);
  try {
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=movieDetails.pdf"
    );
    const movies = await getMovies(moviesJSONPath);
    const foundMovie = movies.find(
      (movie) => movie.imdbID === req.params.movieImdbID
    );
    if (foundMovie) {
      const source = getPDFReadableStream(foundMovie);
      const destination = res;
      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      next(NotFound(`Movie id ${req.params.movieImdbID} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

filesRouter.get("/movies_csv", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=movies.csv");

    const source = getMovieJSONReadableStream();
    const transform = new json2csv.Transform({
      fields: ["title", "year", "type"],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

filesRouter.get("/:movieImdbID/asyncPDF", async (req, res, next) => {
  try {
    const movies = await getMovies();
    const foundMovie = movies.find(
      (movie) => movie.imdbID === req.params.movieImdbID
    );
    await asyncPDFGeneration(foundMovie);
    res.send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default filesRouter;
