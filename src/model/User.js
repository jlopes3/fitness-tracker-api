import mongoose from "mongoose";
import { z } from "zod";
import Exercise from "../model/Exercise.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  { collection: "Users" }
);

UserSchema.path("email").validate((input) => {
  try {
    z.string().email().parse(input);
    return true;
  } catch (err) {
    return false;
  }
}, "Invalid Email");

const User = mongoose.model("User", UserSchema);

export default User;
