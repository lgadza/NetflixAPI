import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util"; // CORE MODULE
import { getPDFWritableStream } from "./fs-tools.js";

export const getPDFReadableStream = (booksArray) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);

  console.log(
    booksArray.map((book) => {
      return [book.title, book.category, book.price];
    })
  );

  const docDefinition = {
    content: [booksArray[0].title, booksArray[0].category],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
export const asyncPDFGeneration = async (postArray) => {
  const source = getPDFReadableStream(postArray);
  const destination = getPDFWritableStream("test.pdf");

  const promiseBasedPipeline = promisify(pipeline);

  await promiseBasedPipeline(source, destination);
};
