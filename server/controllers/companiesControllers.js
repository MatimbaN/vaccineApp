import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import { compareString } from "../utils/index.js";
import Verification from "../models/emailVerification.js";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  //validate fields
  if (!name) {
    next("Company Name is required!");
    return;
  }
  if (!email) {
    next("Email address is required!");
    return;
  }
  if (!password) {
    next("Password is required and must be greater than 6 characters");
    return;
  }

  try {
    const accountExist = await Companies.findOne({ email });

    if (accountExist) {
      next("Email Already Registered. Please Login");
      return;
    }

    // create a new account
    const company = await Companies.create({
      name,
      email,
      password,
    });

    const type = "companies";

    // user token
    const token = company.createJWT();

    res.status(201).json({
      success: true,
      message: "Company Account Created Successfully",
      user: {
        _id: company._id,
        name: company.name,
        email: company.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //validation
    if (!email || !password) {
      next("Please Provide A User Credentials");
      return;
    }

    const company = await Companies.findOne({ email }).select("+password");

    if (!company) {
      next("Invalid email or Password");
      return;
    }
    // check verification
    if (!company?.verified) {
      next(
        "Company email is not verified. Check your email account and verify your email"
      );
      return;
    }

    //compare password
    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      next("Invalid email or Password");
      return;
    }
    company.password = undefined;

    const token = company.createJWT();

    res.status(200).json({
      success: true,
      message: "Login SUccessfully",
      user: company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  const { name, contact, location, profileUrl, about } = req.body;

  try {
    // validation
    if (!name || !location || !about || !contact || !profileUrl) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const updateCompany = {
      name,
      contact,
      location,
      profileUrl,
      about,
      _id: id,
    };

    const company = await Companies.findByIdAndUpdate(id, updateCompany, {
      new: true,
    });

    const token = company.createJWT();

    company.password = undefined;

    res.status(200).json({
      success: true,
      message: "Company Profile Updated Successfully",
      company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const company = await Companies.findById({ _id: id });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//GET ALL COMPANIES
export const getCompanies = async (req, res, next) => {
  try {
    const { search, sort, location } = req.query;

    //conditons for searching filters
    const queryObject = {};

    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    let queryResult = Companies.find(queryObject).select("-password");

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("name");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-name");
    }

    // PADINATIONS
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    // records count
    const total = await Companies.countDocuments(queryResult);
    const numOfPage = Math.ceil(total / limit);
    // move next page
    // queryResult = queryResult.skip(skip).limit(limit);

    // show mopre instead of moving to next page
    queryResult = queryResult.limit(limit * page);

    const companies = await queryResult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//GET  COMPANY JOBS
export const getCompanyJobListing = async (req, res, next) => {
  const { search, sort } = req.query;
  const id = req.body.user.userId;

  try {
    //conditons for searching filters
    const queryObject = {};

    if (search) {
      queryObject.location = { $regex: search, $options: "i" };
    }

    let sorting;
    //sorting || another way
    if (sort === "Newest") {
      sorting = "-createdAt";
    }
    if (sort === "Oldest") {
      sorting = "createdAt";
    }
    if (sort === "A-Z") {
      sorting = "name";
    }
    if (sort === "Z-A") {
      sorting = "-name";
    }

    let queryResult = await Companies.findById({ _id: id }).populate({
      path: "jobPosts",
      options: { sort: sorting },
    });
    const companies = await queryResult;

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

// GET SINGLE COMPANY
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Companies.findById({ _id: id }).populate({
      path: "jobPosts",
      options: {
        sort: "-_id",
      },
    });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

//verify user email
export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  Verification.findOne({ userId })
    .then((result) => {
      if (result) {
        const { expiresAt, token: hashedToken } = result;

        // token has expires
        if (expiresAt < Date.now()) {
          Verification.findOneAndDelete({ userId })
            .then(() => {
              Companies.findOneAndDelete({ _id: userId })
                .then(() => {
                  const message =
                    "Verification token has expired. Sign up again";
                  res.redirect(
                    `/api-v1/companies/verified?status=error&message=${message}`
                  );
                })
                .catch((err) => {
                  res.redirect(`/api-v1/companies/verified?message=`);
                });
            })
            .catch((error) => {
              console.log(error);
              res.redirect(`/api-v1/companies/verified?message=`);
            });
        } else {
          //token valid
          compareString(token, hashedToken)
            .then((isMatch) => {
              if (isMatch) {
                Companies.findOneAndUpdate({ _id: userId }, { verified: true })
                  .then(() => {
                    Verification.findOneAndDelete({ userId }).then(() => {
                      const message = "Email verified successfully";
                      res.redirect(
                        `/api-v1/companies/verified?status=success&message=${message}`
                      );
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    const message = "Verification failed or link is invalid";
                    res.redirect(
                      `/api-v1/companies/verified?status=error&message=${message}`
                    );
                  });
              } else {
                // invalid token
                const message = "Verification failed or link is invalid";
                res.redirect(
                  `/api-v1/companies/verified?status=error&message=${message}`
                );
              }
            })
            .catch((err) => {
              console.log(err);
              res.redirect(`/api-v1/companies/verified?message=`);
            });
        }
      } else {
        const message = "Invalid verification link. Try again later.";
        res.redirect(
          `/api-v1/companies/verified?status=error&message=${message}`
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect(`/api-v1/companies/verified?message=`);
    });
};
