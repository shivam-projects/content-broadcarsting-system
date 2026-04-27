const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        msg: "Unauthorized. Token not provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    // Specific handling
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Session expired. Please login again."
      });
    }

    return res.status(401).json({
      msg: "Invalid token"
    });
  }
};