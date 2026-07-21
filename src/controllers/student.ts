import { Request, Response } from "express";
import { Student } from "../models/student";
import { parsePagination } from "../utils/pagination";

const UNIQUE_VIOLATION = "23505";

const isUniqueViolation = (error: unknown): boolean => {
    return typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const { page, pageSize, limit, offset } = parsePagination(req.query);
        const [items, total] = await Promise.all([
            Student.findAll(limit, offset),
            Student.count()
        ]);
        return res.json({ items, page, pageSize, total });
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar alunos." });
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        return res.json(student);
    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar aluno." });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const { name, email, ra } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
        }

        const createdStudent = await Student.create({ name, email, ra });
        return res.status(201).json({
            message: "Aluno criado com sucesso!",
            student: createdStudent
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ message: "Já existe um aluno com este e-mail." });
        }
        console.error("Erro ao criar aluno:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao criar o aluno." });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const { name, email, ra } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
        }

        const updatedStudent = await Student.update(id, { name, email, ra });
        if (!updatedStudent) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        return res.json({
            message: "Aluno atualizado com sucesso!",
            student: updatedStudent
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ message: "Já existe um aluno com este e-mail." });
        }
        console.error("Erro ao atualizar aluno:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao atualizar o aluno." });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const success = await Student.delete(id);
        if (!success) {
            return res.status(404).json({ message: "Aluno não encontrado para exclusão." });
        }
        return res.json({ message: "Aluno deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar aluno:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao deletar o aluno." });
    }
};
