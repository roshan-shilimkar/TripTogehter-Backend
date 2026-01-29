class ApiError extends Error { 
    constructor(
        statuscode,
        message = "Something went wrong",
        Error = [],
        Stack = ""
    ) {
        super(message)
        this.statuscode = statuscode;
        this.data = null,
            this.message = message,
            this.suceess = false,
            this.Error = Error

        if (Stack) {
            this.stack = Stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }