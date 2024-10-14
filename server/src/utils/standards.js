class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = null;
    this.success = false;

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }

  // Custom JSON serialization method
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message, // Include message explicitly
      errors: this.errors,
      data: this.data,
      success: this.success,
    };
  }
}

export { ApiError, ApiResponse };
