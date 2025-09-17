class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", error = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = { msg: message ?? "Internal server error!!" };
    this.success = false;
    this.error = error;
  }
}

export { ApiError };
