import { Post } from "../models/post";
import { pool } from '../database'; // Ajuste o caminho conforme a sua pasta
import { Request, Response } from "express";


// Esta função é um exemplo de como lidar com uma rota que retorna todos os posts.
export const getPosts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM posts');
        return res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar posts." });
    }
};

// Esta função é um exemplo de como lidar com uma rota que recebe um parâmetro de ID para buscar um post específico.
export const getPostById = async (req: Request, res: Response) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam || "0");
        const result = await pool.query('SELECT * FROM posts WHERE idPost = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Post não encontrado" });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar post:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar post." });
    }
};

export const getSearchPosts = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ message: "Por favor, informe um termo de busca válido." });
        }
        const result = await pool.query(
            'SELECT * FROM posts WHERE LOWER(titulo) LIKE LOWER($1) OR LOWER(conteudo) LIKE LOWER($1)',
            [`%${query}%`]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Nenhum post encontrado para este termo." });
        }

        return res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar posts." });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        // Agora recebemos 'autor' (string) direto do Insomnia
        const { titulo, conteudo, autor } = req.body;

        if (!titulo || !conteudo || !autor) {
            return res.status(400).json({ message: "Título, conteúdo e autor são obrigatórios." });
        }

        const query = `
            INSERT INTO posts (titulo, conteudo, autor) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        
        const values = [titulo, conteudo, autor];
        const result = await pool.query(query, values);

        return res.status(201).json({ 
            message: "Post criado com sucesso! 🚀", 
            post: result.rows[0] 
        });

    } catch (error) {
        console.error("Erro ao criar post:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao criar o post." });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam || "0");

        // Agora atualizamos recebendo 'autor'
        const { titulo, conteudo, autor } = req.body;
        
        const query = `
            UPDATE posts
            SET titulo = $1, conteudo = $2, autor = $3
            WHERE idPost = $4
            RETURNING *;
        `;
        const values = [titulo, conteudo, autor, id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        return res.json({
            message: "Post atualizado com sucesso!",
            post: result.rows[0]
        });

    } catch (error) {
        console.error("Erro ao atualizar post:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao atualizar o post." });
    }
};

// Exemplo otimizado para o DELETE (o mesmo princípio vale para o UPDATE)
export const deletePost = async (req: Request, res: Response) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = parseInt(idParam || "0");

        // O comando DELETE direto
        const result = await pool.query('DELETE FROM posts WHERE idPost = $1', [id]);
        
        // Se rowCount for 0, o ID não existia
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Post não encontrado para exclusão." });
        }

        return res.json({ message: "Post deletado com sucesso!" });

    } catch (error) {
        console.error("Erro ao deletar post:", error);
        res.status(500).json({ message: "Erro interno no servidor ao deletar o post." });
    }
};