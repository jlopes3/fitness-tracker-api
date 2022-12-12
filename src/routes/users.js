import express from "express";
import UserDao from "../data/UserDao.js";
import { factory } from "../util/debug.js";
import { decodeToken } from "../util/token.js";
import ApiError from "../model/ApiError.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const userDao = new UserDao();
const endpoint = "/users";

// pre: user is a Mongoose object
const hidePassword = (user) => {
  const { password, __v, ...rest } = user._doc;
  return rest;
};

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

router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { name, email } = req.query;
    const users = await userDao.readAll({ name, email });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${users.length} users!`,
      data: users.map((user) => hidePassword(user)),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const user = await userDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.post(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { name, email, password } = req.body;
    const user = await userDao.create({ name, email, password });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await userDao.update({ id, name, email, password });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following bookmark!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const user = await userDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.put(
  `${endpoint}/addExercise/:id`,
  checkPermission,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { exerciseName } = req.body;

      const user = await userDao.addExercise({ id, exerciseName });

      res.json({
        status: 200,
        message: `Testing`,
        data: hidePassword(user),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
