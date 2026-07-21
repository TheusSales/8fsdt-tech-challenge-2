import { Request, Response } from 'express';
import { Professor } from '../models/professor';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
        }

        const professor = await Professor.findByEmail(email);
        // Mesma mensagem para e-mail inexistente e senha errada: não entrega
        // quais e-mails estão cadastrados.
        if (!professor) {
            return res.status(401).json({ message: "E-mail ou senha inválidos." });
        }

        const senhaConfere = await comparePassword(password, professor.password_hash);
        if (!senhaConfere) {
            return res.status(401).json({ message: "E-mail ou senha inválidos." });
        }

        const token = signToken({ id: professor.id as number, email: professor.email });
        return res.json({
            token,
            professor: { id: professor.id, name: professor.name, email: professor.email }
        });
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao autenticar." });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const autenticado = req.professor;
        if (!autenticado) {
            return res.status(401).json({ message: "Não autenticado." });
        }

        const professor = await Professor.findById(autenticado.id);
        // Token válido de um professor já removido do banco.
        if (!professor) {
            return res.status(401).json({ message: "Professor não encontrado." });
        }

        return res.json(professor);
    } catch (error) {
        console.error("Erro ao buscar professor autenticado:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar o professor." });
    }
};
