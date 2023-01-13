import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util"; // CORE MODULE
import { getPDFWritableStream } from "./fs-tools.js";

export const getPDFReadableStream = (movie) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [movie.title, movie.type],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
export const asyncPDFGeneration = async (movie) => {
  const source = getPDFReadableStream(movie);
  const destination = getPDFWritableStream("movie.pdf");

  const promiseBasedPipeline = promisify(pipeline);

  await promiseBasedPipeline(source, destination);
};
