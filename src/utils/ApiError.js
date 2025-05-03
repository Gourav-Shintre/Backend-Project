class ApiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode = 500,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;

    // Only override stack if provided; otherwise use the default Error stack
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
