export const badRequestHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res
      .status(400)
      .send({ message: err.message, list: err.errorsList.map((e) => e.msg) });
  } else {
    next(err);
  }
};
export const notFoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(400).send({ message: err.message });
  } else {
    next(next);
  }
};
export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status == 401) {
    res.status(401).send({ message: err.message });
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  console.log("generic error", err);

  res.status(500).send({ message: "The problem is on our end" });
};
