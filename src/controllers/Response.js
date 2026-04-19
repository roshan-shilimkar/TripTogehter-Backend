const SuccessResponse = (res, ResponseStatus = 200, ResponseData=null, ShowAPIMessage = false, SuccessMsg='') => {
    return res.status(ResponseStatus).json({
        Success: true,
        Res_Data: ResponseData,
        ShowAPIMessage: ShowAPIMessage,
        SuccessMsg: SuccessMsg,
    })
}

const ErrorResponse = (res, statusCode = 500, Errmessage = "Error", code = "SERVER_ERROR", details = null) => {
    return res.status(statusCode).json({
        success: false,
        Errmessage,
        data: null,
        error: {
            code,
            details
        }
    });
};

export { SuccessResponse, ErrorResponse }