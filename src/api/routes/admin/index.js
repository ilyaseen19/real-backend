const express = require("express");
const { _encrypt, _decrypt } = require("../../libs/encrypt");
const { upload } = require("../../middlewares/imageUpload");
const Admin = require("../../modules/admin");

const router = express.Router();

router.get("/getAdmins", async (req, res) => {
  try {
    const data = await Admin.find();
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
    const data = await Admin.findOne({ email });
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

router.patch(
  "/updateWithImage/:ID",
  upload.single("profileImg"),
  async (req, res) => {
    try {
      const url = req.protocol + "://" + req.get("host");
      const profileImg = url + "/public/" + req.file.filename;
      const data = await JSON.parse(req.body.data);
      const _id = req.params.ID;
      const { firstName, lastName, email, phone, address } = data;

      const updated = await Agent.updateOne(
        {
          _id,
        },
        {
          $set: {
            firstName,
            lastName,
            email,
            phone,
            address,
            image: profileImg,
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
  }
);

router.patch("/update/:ID", async (req, res) => {
  try {
    const _id = req.params.ID;
    const { firstName, lastName, email, phone, address, image } = req.body;
    const updated = Admin.updateOne(
      {
        _id,
      },
      {
        $set: {
          firstName,
          lastName,
          email,
          phone,
          address,
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
    const updated = await Admin.updateOne(
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
    const deleted = await Admin.findByIdAndDelete({ _id: req.params.ID });
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

router.post("/create", upload.single("profileImg"), async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const profileImg = req.file.filename === undefined ? ""  : url + "/public/" + req.file.filename;
    const data = await JSON.parse(req.body.data);
    const { firstName, lastName, phone, email, password, role, address } = data;
    const emailExist = await Admin.findOne({ email });

    if (emailExist)
      return res.status(400).json({
        success: 0,
        message: "User with this email already exist",
      });

    if (emailExist && emailExist.phone === phone)
      return res.status(400).json({
        success: 0,
        message: "User with this phone number already exist",
      });

    const encryptedPass = await _encrypt(password);
    const user = new Admin({
      firstName,
      lastName,
      phone,
      email,
      password: encryptedPass,
      address,
      role,
      image: profileImg,
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
