const bcrypt = require("bcrypt");
const UserSchema = require("./UserSchema");
const jwt = require("jsonwebtoken");

const secretKey = "MY_SECRET_KEY";

const generateToken = (data, exp) => {
  if (!exp) exp = Date.now() / 1000 + 24 * 60 * 60;
  const token = jwt.sign({ data, exp }, secretKey);
  return token;
};

const decodeToken = (token) => {
  let data;
  try {
    data = jwt.verify(token, secretKey);
  } catch (err) {
    console.log("Error verifying token");
  }
  return data;
};

const generateNewAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({
      status: false,
      message: "Refresh token required",
    });
    return;
  }

  const user = await UserSchema.findOne({
    "tokens.refreshToken.token": refreshToken,
  });
  if (!user) {
    res.status(400).json({
      status: false,
      message: "User not found",
    });
    return;
  }
  const aTokenExp = Date.now() / 1000 + 24 * 60 * 60;
  const aToken = generateToken(
    { name: user.name, email: user.email },
    aTokenExp
  );
  
  user.tokens.accessToken = {
    token: aToken,
    expireAt: new Date(aTokenExp * 1000),
  };
  user
    .save()
    .then((user) => {
      res.status(201).json({
        status: true,
        message: "Access token created",
        data: user,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Error creating Access token",
        error: err,
      });
    });
};

const verifyEmail = (email) => {
  const regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
  return regex.test(email);
};

const signupUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name,email,password)
  if (!name || !email || !password) {
    res.status(400).json({
      status: false,
      message: "All fields are required",
    });
    return;
  }
  if (!verifyEmail(email)) {
    res.status(400).json({
      status: false,
      message: "Enter valid E-mail address",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const aTokenExp = Date.now() / 1000 + 24 * 60 * 60;
  const rTokenExp = Date.now() / 1000 + 20 * 24 * 60 * 60;

  const aToken = generateToken({ name, email }, aTokenExp);
  const rToken = generateToken({ name, email }, rTokenExp);

  const newUser = new UserSchema({
    name,
    email,
    password: hashedPassword,
    tokens: {
      accessToken: {
        token: aToken,
        expireAt: new Date(aTokenExp * 1000),
      },
      refreshToken: {
        token: rToken,
        expireAt: new Date(rTokenExp * 1000),
      },
    },
  });
 
  newUser
    .save()
    .then((user) => {
      res.status(201).json({
        status: true,
        message: "New user created",
        data: user,
      });
    })
    .catch((err) =>
      res.status(500).json({
        status: false,
        message: "Error creating user",
        error: err,
      })
    );
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      status: false,
      message: "All fields are required",
    });
    return;
  }
  if (!verifyEmail(email)) {
    res.status(400).json({
      status: false,
      message: "Enter valid E-mail address",
    });
    return;
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    res.status(400).json({
      status: false,
      message: "User not found",
    });
    return;
  }

  const dbPassword = user.password;
  const matched = await bcrypt.compare(password, dbPassword);
  if (!matched) {
    res.status(422).json({
      status: false,
      message: "Credentials not matched!",
    });
    return;
  }

  res.status(201).json({
    status: true,
    message: "Login successful",
    data: user,
  });
};

module.exports = { signupUser, loginUser, generateNewAccessToken };
