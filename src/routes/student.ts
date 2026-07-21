import { Router } from "express";
import {
    createStudent,
    deleteStudent,
    getStudentById,
    getStudents,
    updateStudent
} from "../controllers/student";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Gestão de alunos é área administrativa: tudo exige token.
router.use(requireAuth);

router.get("/", getStudents);

router.get("/:id", getStudentById);

router.post("/", createStudent);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

export default router;
