const jwt = require("jsonwebtoken");

const verifyToken = (request, response, next) => {
    const headerToken = request.headers.token;
    if(headerToken) {
        jwt.verify(headerToken, process.env.JWT_SEC_KEY, (error,verificationResult) => {
            if (error) {
                response.status(403).json("Invalid Authentication Token")
            } else {
                response.tokenVerification = verificationResult;
                next();
            }
        });
    } else {
        response.status(403).json("User is not authorised for this request");
    }
}

const verifyTokenAndAuthorization = (originalRequest, verificationResponse, next) => {
    verifyToken(originalRequest, verificationResponse , () => {
        if (verificationResponse.tokenVerification.id === originalRequest.params.id) {
            next();
        } else {
            originalRequest.status(403).json("You are not Authorized for this request");
        }
    })
}

module.exports = { verifyToken, verifyTokenAndAuthorization }