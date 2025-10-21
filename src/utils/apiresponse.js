class apiresponse {
    constructor(statuscode,data,message = "Success"){
        this.statuscode = statuscode;
        this.data = data,
        this.message = message,
        this.suceess = this.statuscode < 400 
    }
}

export default apiresponse;