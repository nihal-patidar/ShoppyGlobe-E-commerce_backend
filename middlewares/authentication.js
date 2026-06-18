import jwt from "jsonwebtoken";

async function auth(req, res, next) {
  try {
    // extract token from header
    const token = req.headers?.authorization?.split(" ")[1];

    // token missing
    if (!token) {
      return res.status(401).send({
        msg: "Authentication token is required",
      });
    }

    // verify token
    const data = jwt.verify(token, process.env.JWT_KEY);

    // attach user data to request
    req.user = {...data.user , userId : data.user._id};

    // console.log("req.user" , req.user);
    next();
  } catch (err) {
    return res.status(401).send({
      msg: "Invalid or expired token",
    });
  }
}

export default auth;