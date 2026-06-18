import User from "../models/userModel";

async function userRegister(req, res) {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).send({
      msg: "User name is Required",
    });
  }

  // better email validation using regex pattern matching
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send({
      msg: "Invalid email address",
    });
  }

  // improve this one
  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).send({
      msg: "Password must contain 8+ characters, one uppercase letter, one lowercase letter and one number",
    });
  }

  try {

  const existingUser = await User.findOne({email : email});
  
  if(existingUser){
    return res.status(409).send({
        msg : "User already exists"
    })
  }

    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
    });


    // don't need use save() method , create already save to db
    // newUser.save(); 

    res.status(201).send({
      msg: "User has been successfully created",
    });
  } catch (err) {
    return res.status(500).send({
      msg: "Internal Server error",
    });
  }
}

function userLogin(req, res) {}

export {userRegister , userLogin};
