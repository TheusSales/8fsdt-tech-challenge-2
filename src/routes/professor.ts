import { Router } from "express";
import {
    createProfessor,
    deleteProfessor,
    getProfessorById,
    getProfessors,
    updateProfessor
} from "../controllers/professor";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Gestão de professores é área administrativa: tudo exige token.
router.use(requireAuth);

router.get("/", getProfessors);

router.get("/:id", getProfessorById);

router.post("/", createProfessor);

router.put("/:id", updateProfessor);

router.delete("/:id", deleteProfessor);

export default router;
