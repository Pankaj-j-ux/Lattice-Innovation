/** @format */
const connection = require("../Config/db_config");
const cloudinary = require("cloudinary");
const bcrypt = require("bcryptjs");

exports.addpatient = async (req, res, next) => {
  try {
    let result;
    let {
      Patient_Name,
      Address,
      Email,
      Phone_Number,
      Password,
      Doctor_id,
      Hospital_id,
    } = req.body;

    if (!req.files) {
      throw Error("Patient's Photo is required");
    }

    if (
      !Patient_Name &&
      !Address &&
      !Email &&
      !Phone_Number &&
      !Password &&
      !Doctor_id &&
      !Hospital_id
    ) {
      throw Error("Please Enter all the Credientials !");
    }

    if (Address.length < 10) {
      throw Error("Address should be at least 10 Character long !");
    }

    var emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var valid = emailRegex.test(Email);
    if (!valid) {
      throw Error("Please Enter valid Email address !");
    }

    var phoneRegex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (phoneRegex.test(Phone_Number)) {
      throw Error("Please Enter valid Phone Number !");
    }

    var strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );

    if (!strongRegex.test(Password)) {
      throw Error(
        "Your password is week! Password must contain atleast 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character and password must be 8 character long"
      );
    }

    let file = req.files.Patient_Photo;

    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    const salt = await bcrypt.genSaltSync(parseInt(process.env.BCJS_SALT));
    Password = await bcrypt.hash(Password, salt);

    const sqlquery = `insert into Patient(Patient_Name, Email, Phone_Number, Password, Address, Patient_Photo, Hospital_id, Doctor_id) values("${Patient_Name}","${Email}","${Phone_Number}","${Password}", "${Address}","${result.secure_url}", "${Hospital_id}", "${Doctor_id}");`;
    const promise = new Promise((resolve, reject) => {
      connection.query(sqlquery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output = await promise;

    const sqlquery1 = `Select Patients_Count from Doctor where Doctor_id = ${Doctor_id};`;
    const promise1 = new Promise((resolve, reject) => {
      connection.query(sqlquery1, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output1 = await promise1;

    const sqlquery2 = `Update Doctor set Patients_Count = ${output1[0].Patients_Count}+1 where Doctor_id = ${Doctor_id};`;
    const promise2 = new Promise((resolve, reject) => {
      connection.query(sqlquery2, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output2 = await promise2;

    if (output) {
      res.status(200).json({
        success: true,
        Patient: {
          id: output.id,
          Name: Patient_Name,
          Email: Email,
          Address: Address,
          Photo: result.secure_url,
        },
      });
    }
  } catch (err) {
    console.log("ERROR FROM ADD PATIENTS :: ", err.message);
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getHospitalDetails = async (req, res, next) => {
  try {
    let { Hospital_id } = req.body;

    if (!Hospital_id) {
      throw Error("Please send hospital id");
    }

    const sqlquery2 = `Select Hospital_Name from Hospital where _id = ${Hospital_id}`;
    const promise2 = new Promise((resolve, reject) => {
      connection.query(sqlquery2, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output2 = await promise2;

    if (output2.length < 1) {
      throw Error("Please send Correct hospital id");
    }

    const sqlquery = `Select Doctor_id, Doctor_Name, Patients_Count from Doctor where Hospital_id = ${Hospital_id}`;
    const promise = new Promise((resolve, reject) => {
      connection.query(sqlquery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output = await promise;

    const sqlquery1 = `Select count(Patient_id) as count from Patient where Hospital_id = ${Hospital_id}`;
    const promise1 = new Promise((resolve, reject) => {
      connection.query(sqlquery1, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const output1 = await promise1;

    res.status(200).json({
      success: true,
      "Hospital Name": output2[0].Hospital_Name,
      "Total Psychiatrist count": output.length,
      "Total Patients count": output1[0].count,
      "Psychiatrist Details": output,
    });
  } catch (err) {
    console.log("ERROR FROM GET GROUP DETAILS :: ", err.message);
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
