import User from "../models/userModel.js";
import bcrypt from "bcrypt";

async function userRegister(req, res) {
  // extract request data
  const { name, email, password } = req.body;

  // validate name
  if (!name) {
    return res.status(400).send({
      msg: "Name is required",
    });
  }

  // validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send({
      msg: "Invalid email address",
    });
  }

  // validate password strength
  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).send({
      msg: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
    });
  }

  try {
    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).send({
        msg: "An account with this email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // success response
    return res.status(201).send({
      msg: "User registered successfully",
    });
  } catch (err) {
    console.log("userRegister", err);

    // server error response
    return res.status(500).send({
      msg: "Something went wrong. Please try again later",
    });
  }
}

async function userLogin(req, res) {
  const { email, password } = req.body;


  // validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send({
      msg: "Invalid email address",
    });
  }

  // validate password strength
  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).send({
      msg: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
    });
  }

  try{
    
    const existingUser = await User.findOne({email : email});

    if(!existingUser){
        return res.status(404).send({
            msg : "User Not Found"
        })
    }

    const isMatch = await bcrypt.compare(password , existingUser.password);

    if(!isMatch){ // password doesn't match 
        return res.status(400).send({
            msg : "Password Not Matched"
        })
    }

    return res.status(200).send({
        msg : "User login successful"
    })
    
  }catch(err){
    return res.status(500).send({
        msg : "Internal Server Error"
    })
  }
}

export { userRegister, userLogin };
