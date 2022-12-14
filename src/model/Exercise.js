import mongoose from "mongoose";
import { z } from "zod";

const ExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { collection: "Exercises" }
);

const Exercise = mongoose.model("Exercise", ExerciseSchema);

export default Exercise;
