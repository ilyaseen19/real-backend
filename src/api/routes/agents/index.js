const express = require("express");
const { _encrypt, _decrypt } = require("../../libs/encrypt");
const { _generateQr } = require("../../libs/qr");
const { upload } = require("../../middlewares/imageUpload");
const Agent = require("../../modules/agents");

const router = express.Router();

router.get("/getAgents", async (req, res) => {
  try {
    const data = await Agent.find();
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
    const data = await Agent.findOne({ email });
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
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        fbAct,
        twAct,
        insAct,
        isBlocked,
      } = data;

      const qr = await _generateQr({
        firstName,
        lastName,
        phone,
        email,
        confirm: `Mr ${firstName} is registered to hodalor estate`,
      });

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
            fbAct,
            twAct,
            insAct,
            qr,
            isBlocked,
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
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      fbAct,
      twAct,
      insAct,
      isBlocked,
    } = req.body;

    const qr = await _generateQr({
      firstName,
      lastName,
      phone,
      email,
      confirm: `Mr ${firstName} is registered to hodalor estate`,
    });

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
          fbAct,
          twAct,
          insAct,
          qr,
          isBlocked,
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
    const { password, new_pass, email } = req.body;
    const passExist = await Agent.findOne({ email });

    const initPass = await _decrypt(passExist.password);

    if (initPass !== password)
      return res.status(400).json({
        success: 0,
        message: "Password is not correct!",
      });

    const encryptedPass = await _encrypt(new_pass);
    const updated = await Agent.updateOne(
      { _id: req.params.ID },
      {
        $set: {
          password: encryptedPass,
        },
      }
    ).catch((error) => {
      console.log(error);
      return res.status(500).json({
        success: 0,
        message: "Internal eroor, code (5000)",
      });
    });

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
    const deleted = await Agent.findByIdAndDelete({ _id: req.params.ID });
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
    const profileImg = url + "/public/" + req.file.filename;
    const data = await JSON.parse(req.body.data);
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      role,
      address,
      dob,
      ghanaCard,
      gr1,
      gr1Contact,
      gr1Relation,
      gr2,
      gr2Contact,
      gr2Relation,
      fbAct,
      twAct,
      insAct,
    } = data;
    const emailExist = await Agent.findOne({ email });

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

    if (emailExist && emailExist.ghanaCard === ghanaCard)
      return res.status(400).json({
        success: 0,
        message: "User with this ghana card ID already exist",
      });

    const qr = await _generateQr({
      firstName,
      lastName,
      phone,
      email,
      confirm: `Mr ${firstName} is registered to hodalor estate`,
    });

    const encryptedPass = await _encrypt(password);
    const user = new Agent({
      firstName,
      lastName,
      phone,
      email,
      password: encryptedPass,
      address,
      role,
      image: profileImg,
      dob,
      ghanaCard,
      gr1,
      gr1Contact,
      gr1Relation,
      gr2,
      gr2Contact,
      gr2Relation,
      fbAct,
      twAct,
      insAct,
      qr,
      deals: "0",
      isBlocked: false,
    });
    const savedUser = await user.save();
    if (savedUser)
      return res.status(201).json({
        success: 1,
        message: "Agent created successfully",
      });

    if (!savedUser)
      return res.status(400).json({
        success: 0,
        message: "Could not save agent",
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
