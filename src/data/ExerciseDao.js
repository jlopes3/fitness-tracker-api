import Exercise from "../model/Exercise.js";
import ApiError from "../model/ApiError.js";
import { z } from "zod";
import mongoose from "mongoose";

const validObjectId = z
  .string()
  .refine((id) => mongoose.isValidObjectId(id), "Invalid ID!");
const validName = z.string().min(1, "Missing name attribute!");

class ExerciseDao {
  // return the created exercise
  // throws ApiError when name is invalid
  async create({ name, userId }) {
    let result = validName.safeParse(name);
    if (!result.success) {
      throw new ApiError(400, "Invalid Name!");
    }
    const exercise = await Exercise.create({ name, userId });
    return exercise;
  }

  // return all exercises
  async readAll({ name, userId }) {
    const filter = {};
    if (name) {
      filter.name = name;
    }

    if (userId) {
      filter.userId = userId;
    }

    const exercises = await Exercise.find(filter);
    return exercises;
  }

  // return the exercise with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    const result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      throw new ApiError(404, "Resource not found!");
    }

    return exercise;
  }

  // return the updated exercise
  // throws ApiError if id is invalid or resource does not exist in our database
  async update({ id, name, userId }) {
    let result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    if (name !== undefined) {
      result = validName.safeParse(name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
      }
    }

    const exercise = await Exercise.findByIdAndUpdate(
      id,
      { name, userId },
      { new: true, runValidators: true }
    );
    if (!exercise) {
      throw new ApiError(404, "Resource not found!");
    }

    return exercise;
  }

  // return the deleted exercise
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    const result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) {
      throw new ApiError(404, "Resource not found!");
    }

    return exercise;
  }

  async deleteMany(id) {
    await Exercise.deleteMany({ userId: id });
  }

  async deleteAll() {
    await Exercise.deleteMany({});
  }
}

export default ExerciseDao;
