const express = require("express");
const { _decrypt } = require("../../libs/encrypt");
const Admin = require("../../modules/admin");
const Agent = require("../../modules/agents");
const Customers = require("../../modules/customers");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    email.toLowerCase();
    const adminExist = await Admin.find();
    const agentExist = await Agent.find();
    const customerExist = await Customers.find();

    const users = [...adminExist, ...agentExist, ...customerExist];

    const userExist = await users.find((user) => user.email === email);

    if (!userExist)
      return res.status(400).json({
        success: 0,
        message: "Either email or password is not correct",
      });

    const dbPass = userExist.password;
    const decrypted = await _decrypt(dbPass);

    if (decrypted !== password)
      return res.status(400).json({
        success: 0,
        message: "Either email or password is not correct",
      });

    if (userExist && userExist.isBlocked !== undefined && userExist.isBlocked)
      return res.status(400).json({
        success: 0,
        message:
          "Your account has been blocked, Please contact support team for help!",
      });

    return res.status(200).json({
      success: 1,
      user: userExist,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 0,
      message: "Error code 500",
    });
  }
});

module.exports = router;
