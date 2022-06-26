const express = require("express");
const { _encrypt, _decrypt } = require("../../libs/encrypt");
const Customer = require("../../modules/customers");

const router = express.Router();

router.get("/getCustomers", async (req, res) => {
  try {
    const data = await Customer.find();
    if (data.length === 0)
      return res.status(404).json({
        success: 0,
        message: "No data found",
      });

    if (data.length !== 0)
      return res.status(200).json({
        success: 1,
        data: data,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.get("/getOne/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const data = await Customer.findOne({ email });
    if (data)
      return res.status(200).json({
        success: 1,
        data: data,
      });

    if (!data)
      return res.status(404).json({
        success: 0,
        message: "No data found",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.patch("/update/:ID", async (req, res) => {
  try {
    const _id = req.params.ID;
    const { firstName, lastName, email, phone, role, image } = req.body;
    const updated = Customer.updateOne(
      {
        _id,
      },
      {
        $set: {
          firstName,
          lastName,
          email,
          phone,
          role,
          image,
        },
      }
    );

    if (updated.modifiedCount > 0)
      return res.status(201).json({
        success: 1,
        message: "Data updated successfully",
      });

    if (updated.modifiedCount <= 0)
      return res.status(400).json({
        success: 0,
        message: "Could not update user",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Internal Error: (500)",
    });
  }
});

router.patch("/updatePassword/:ID", async (req, res) => {
  try {
    const { password } = req.body;
    const encryptedPass = await _encrypt(password);
    const updated = await Customer.updateOne(
      { _id: req.params.ID },
      {
        $set: {
          password: encryptedPass,
        },
      }
    );

    if (updated.modifiedCount > 0)
      return res.status(201).json({
        success: 1,
        message: "Password updated successfully",
      });

    if (updated.modifiedCount <= 0)
      return res.status(400).json({
        success: 0,
        message: "Could not update password",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: "Error code 500",
    });
  }
});

router.delete("/remove/:ID", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete({ _id: req.params.ID });
    if (deleted)
      return res.status(200).json({
        success: 1,
        message: "Data removed successfully",
      });

    if (!deleted)
      return res.status(400).json({
        success: 0,
        message: "Could not remove data",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 0,
      message: "Error code 500",
    });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;
    const emailExist = await Customer.findOne({ email });

    if (emailExist)
      return res.status(400).json({
        success: 0,
        message: "User with this email already exist",
      });

    if (emailExist.phone === phone)
      return res.status(400).json({
        success: 0,
        message: "User with this phone number already exist",
      });

    const encryptedPass = await _encrypt(password);
    const user = new Customer({
      firstName,
      lastName,
      phone,
      email,
      password: encryptedPass,
      role,
    });
    const savedUser = await user.save();
    if (savedUser)
      return res.status(201).json({
        success: 1,
        message: "User created successfully",
      });

    if (!savedUser)
      return res.status(400).json({
        success: 0,
        message: "Could not save user",
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
