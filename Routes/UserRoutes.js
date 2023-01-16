/** @format */

const router = require("express").Router();
const {
  addpatient,
  getHospitalDetails,
} = require("../Controllers/UserController");

router.route("/addpatient").post(addpatient);
router.route("/gethospitaldetail").get(getHospitalDetails);

module.exports = router;
