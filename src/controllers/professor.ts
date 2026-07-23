import { Request, Response } from "express";
import { Professor } from "../models/professor";
import { hashPassword } from "../utils/password";
import { parsePagination } from "../utils/pagination";

import { isUniqueViolation, isValueTooLong } from "../utils/dbErrors";

// Limites das colunas em src/scripts/schema.sql.
const TAMANHO_EXCEDIDO = "Nome deve ter até 120 caracteres e e-mail até 160.";

export const getProfessors = async (req: Request, res: Response) => {
    try {
        const { page, pageSize, limit, offset } = parsePagination(req.query);
        const [items, total] = await Promise.all([
            Professor.findAll(limit, offset),
            Professor.count()
        ]);
        return res.json({ items, page, pageSize, total });
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar professores." });
    }
};

export const getProfessorById = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const professor = await Professor.findById(id);
        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }
        return res.json(professor);
    } catch (error) {
        console.error("Erro ao buscar professor:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar professor." });
    }
};

export const createProfessor = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
        }

        const password_hash = await hashPassword(password);
        const createdProfessor = await Professor.create({ name, email, password_hash });
        return res.status(201).json({
            message: "Professor criado com sucesso!",
            professor: createdProfessor
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ message: "Já existe um professor com este e-mail." });
        }
        if (isValueTooLong(error)) {
            return res.status(400).json({ message: TAMANHO_EXCEDIDO });
        }
        console.error("Erro ao criar professor:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao criar o professor." });
    }
};

export const updateProfessor = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const { name, email, password } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
        }

        // Senha em branco na edição significa "manter a atual".
        const password_hash = password ? await hashPassword(password) : null;
        const updatedProfessor = await Professor.update(id, { name, email, password_hash });
        if (!updatedProfessor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }
        return res.json({
            message: "Professor atualizado com sucesso!",
            professor: updatedProfessor
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return res.status(409).json({ message: "Já existe um professor com este e-mail." });
        }
        if (isValueTooLong(error)) {
            return res.status(400).json({ message: TAMANHO_EXCEDIDO });
        }
        console.error("Erro ao atualizar professor:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao atualizar o professor." });
    }
};

export const deleteProfessor = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);

        // Evita que o professor logado se exclua e perca o acesso ao admin.
        if (req.professor?.id === id) {
            return res.status(409).json({ message: "Você não pode excluir o próprio usuário." });
        }

        const success = await Professor.delete(id);
        if (!success) {
            return res.status(404).json({ message: "Professor não encontrado para exclusão." });
        }
        return res.json({ message: "Professor deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar professor:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao deletar o professor." });
    }
};
