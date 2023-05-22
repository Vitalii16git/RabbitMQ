const jwt = require("jsonwebtoken");
const errorMessage = require("../utils/error.messages.js");

module.exports = (req, res, next) => {
  if (req.method === "OPTION") {
    next();
  }

  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(403).json({ message: errorMessage.notAuthorized });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: errorMessage.notAuthorized });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
    next();
  } catch (error) {
    console.log(error);
  }
};
