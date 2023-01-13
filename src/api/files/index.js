import express from "express";
import multer from "multer";
import { extname } from "path";
import json2csv from "json2csv";
import {
  saveMoviesAvatars,
  getMovies,
  writeMovies,
} from "../../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getPostJSONReadableStream } from "../../lib/fs-tools.js";
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
}).single("avatar");

filesRouter.post(
  "/:movieId/uploadAvatar",
  multer().single("avatar"),
  multer().array("avatar"),
  async (req, res, next) => {
    try {
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.movieId + originalFileExtension;

      await saveMoviesAvatars(fileName, req.file.buffer);

      const url = `http://localhost:3001/img/blogPosts/${fileName}`;

      const movies = await getMovies();
      console.log("we are the users", movies);

      const index = movies.findIndex(
        (movie) => movie.id === req.params.movieId
      );
      if (index !== -1) {
        const oldMovie = movies[index];

        const movie = { ...oldMovie.movie, avatar: url };
        const updatedMovie = { ...oldMovie, movie, updatedAt: new Date() };

        movies[index] = updatedMovie;

        await writeMovies(movies);
      }

      res.send("File uploaded");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

filesRouter.post(
  "/multiple",
  multer().array("avatars"),
  async (req, res, next) => {
    try {
      console.log("FILES:", req.files);
      await Promise.all(
        req.files.map((file) =>
          saveMoviesAvatars(file.originalname, file.buffer)
        )
      );
      res.send("File uploaded");
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/:movieId/uploadCover",
  multer().single("postCover"),
  async (req, res, next) => {
    try {
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.movieId + originalFileExtension;

      await saveMoviesAvatars(fileName, req.file.buffer);

      const url = `http://localhost:3001/img/movies/${fileName}`;

      const movies = await getMovies();

      const index = movies.findIndex(
        (movie) => movie.id === req.params.movieId
      );
      if (index !== -1) {
        const oldMovie = movies[index];

        const movie = { ...oldMovie.movie, avatar: url };
        const updatedMovie = { ...oldMovie, movie, updatedAt: new Date() };

        movies[index] = updatedMovie;

        await writeMovies(movies);
      }

      res.send("File uploaded");
    } catch (error) {
      next(error);
    }
  }
);
filesRouter.get("/pdf", (req, res, next) => {
  console.log("firing");
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogpost.pdf");
    const source = getPDFReadableStream([
      {
        asin: "0345546792",
        title: "The Silent Corner: A Novel of Suspense (Jane Hawk)",
        img: "https://images-na.ssl-images-amazon.com/images/I/91dDIYze1wL.jpg",
        price: 7.92,
        category: "horror",
      },
      {
        asin: "0735218994",
        title: "Celtic Empire (Dirk Pitt Adventure)",
        img: "https://images-na.ssl-images-amazon.com/images/I/91xI4GjM7jL.jpg",
        price: 17.32,
        category: "horror",
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

filesRouter.get("/postCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=movies.csv");

    const source = getPostJSONReadableStream();
    const transform = new json2csv.Transform({
      fields: ["name", "username"],
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
