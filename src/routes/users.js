import express from "express";
import UserDao from "../data/UserDao.js";
import ExerciseDao from "../data/ExerciseDao.js";
import { decodeToken } from "../util/token.js";
import ApiError from "../model/ApiError.js";

const router = express.Router();
export const userDao = new UserDao();
export const exerciseDao = new ExerciseDao();
const endpoint = "/users";

// pre: user is a Mongoose object
const hidePassword = (user) => {
  const { password, __v, ...rest } = user._doc;
  return rest;
};

// checks authoirzation
const checkPermission = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    const { id } = decodeToken(token);

    if (req.method === "GET" && id === req.params.id) {
      return next();
    } else if (req.method === "PUT" && id === req.params.id) {
      return next();
    } else if (req.method === "DELETE" && id === req.params.id) {
      return next();
    }

    return next(new ApiError(403, "Access forbidden"));
  } catch (err) {
    return next(new ApiError(401, "Unauthorized"));
  }
};

// get all users with name and email as filters
// MAY WANT TO RECONSIDER WHO CAN ACCESS
router.get(`/users`, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const users = await userDao.readAll({ name, email });
    console.log(name);
    console.log(users);
    res.json({
      status: 200,
      message: `Successfully retrieved ${users.length} users!`,
      data: users.map((user) => hidePassword(user)),
    });
  } catch (err) {
    next(err);
  }
});

// gets a user with an id, needs authorization
router.get(`/users/:id`, checkPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userDao.read(id);
    res.json({
      status: 200,
      message: `Successfully retrieved the following user!`,
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

// Creates a new user
router.post(`/users`, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await userDao.create({ name, email, password });
    res.status(201).json({
      status: 201,
      message: `Successfully created the following user!`,
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

// Updates an existing user name, email, or password
router.put(`/users/:id`, checkPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await userDao.update({ id, name, email, password });
    res.json({
      status: 200,
      message: `Successfully updated the following bookmark!`,
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

// Delete a user and their exercises given the user's id
router.delete(`/users/:id`, checkPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    exerciseDao.deleteMany(id);
    const user = await userDao.delete(id);
    res.json({
      status: 200,
      message: `Successfully deleted the following user and their exercises!`,
      data: hidePassword(user),
    });
  } catch (err) {
    next(err);
  }
});

// Make an exercise giving a name and userId
router.post(`/exercises`, async (req, res, next) => {
  try {
    const { name, userId } = req.body;
    const exercise = await exerciseDao.create({ name, userId });
    res.status(201).json({
      status: 201,
      message: `Successfully created the following exercise!`,
      data: exercise,
    });
  } catch (err) {
    next(err);
  }
});

// Get an exercise giving the id
router.get(`/exercises/:id/`, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = id;
    const exercises = await exerciseDao.readAll({
      name: undefined,
      userId: userId,
    });
    res.json({
      status: 200,
      message: `Successfully retrieved the following user's exercises!`,
      data: exercises,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
