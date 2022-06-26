const qr = require("qrcode");

// generate qr code
const _generateQr = async (data) => {
  let q;
  try {
    q = await qr.toDataURL(JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }

  return q;
};

module.exports = {
  _generateQr,
};
