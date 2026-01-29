import apiresponse from "../utils/apiresponse.js"

const checkHealth = (req, res) => {
    try {
        res.status(200).json(
            new apiresponse(200,{message:"Server running"})
        )
    } catch (err) {
        console.log(err);
    }
}

export {checkHealth}