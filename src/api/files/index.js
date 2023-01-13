import express from "express";
import multer from "multer";
import { extname } from "path";
import json2csv from "json2csv";
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

        const poster = url;
        const updatedMovie = { ...oldMovie, poster, updatedAt: new Date() };

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
  console.log("firing");
  try {
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=movieDetails.pdf"
    );
    const movies = await getMovies(moviesJSONPath);
    const foundMovie = movies.find(
      (movie) => movie.imdbID === req.params.movieImdbID
    );
    console.log(foundMovie);
    const source = getPDFReadableStream([
      {
        fields: ["title", "year", "type"],
      },
    ]);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
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

filesRouter.get("/asyncPDF", async (req, res, next) => {
  try {
    const movies = await getMovies();
    await asyncPDFGeneration(movies);
    res.send();
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
