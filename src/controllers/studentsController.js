// src/controllers/studentsController.js

import createHttpError from "http-errors";
import { Student } from "../models/student.js";

export const getStudents = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    gender,
    minAvgMark,
    sortBy = "_id",
    sortOrder = "asc",
  } = req.query;

  const skip = (page - 1) * perPage;

  const studentsQuery = Student.find({ userId: req.user._id });

  // Фільтрація
  if (gender) {
    studentsQuery.where("gender").equals(gender);
  }
  if (minAvgMark) {
    studentsQuery.where("avgMark").gte(minAvgMark);
  }

  // Пагінація + сортування
  const [totalItems, students] = await Promise.all([
    studentsQuery.clone().countDocuments(),
    studentsQuery
      .skip(skip)
      .limit(perPage)
      // Додамєдо сортування в ланцюжок методів квері
      .sort({ [sortBy]: sortOrder }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    students,
  });
};

export const getStudentById = async (req, res, next) => {
  const { studentId } = req.params;

  const student = await Student.findOne({
    _id: studentId,
    userId: req.user._id,
  });

  if (!student) {
    return next(createHttpError(404, "Student not found"));
  }

  res.status(200).json(student);
};

export const createStudent = async (req, res) => {
  const student = await Student.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(student);
};

export const deleteStudent = async (req, res, next) => {
  const { studentId } = req.params;
  const student = await Student.findOneAndDelete({
    _id: studentId,
    userId: req.user._id,
  });

  if (!student) {
    next(createHttpError(404, "Student not found"));
    return;
  }

  res.status(200).send(student);
};

export const updateStudent = async (req, res, next) => {
  const { studentId } = req.params;

  const student = await Student.findOneAndUpdate(
    { _id: studentId, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!student) {
    next(createHttpError(404, "Student not found"));
    return;
  }

  res.status(200).json(student);
};
