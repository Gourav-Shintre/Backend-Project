class ApiError extends Error{
  constructor(
    message="Something Went Wrong",
    statusCode,
    errors=[],
    stack=""

  ){
    super(message)
    this.message=message,
    this.errors=errors,
    this.statusCode=statusCode,
    this.stack=stack

  }
}

export default ApiError