import { Post, IPost } from "../models/post";
import { Request, Response } from "express";
import { parsePagination } from "../utils/pagination";
import { isValueTooLong } from "../utils/dbErrors";

// Limites das colunas em src/scripts/schema.sql. `conteudo` é TEXT, sem limite.
const TAMANHO_EXCEDIDO = "Título deve ter até 150 caracteres e autor até 100.";

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll();
        return res.json(posts);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar posts." });
    }
};

// Listagem paginada para a tela administrativa do app mobile.
export const getAdminPosts = async (req: Request, res: Response) => {
    try {
        const { page, pageSize, limit, offset } = parsePagination(req.query);
        const [items, total] = await Promise.all([
            Post.findPaginated(limit, offset),
            Post.count()
        ]);
        return res.json({ items, page, pageSize, total });
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar posts." });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post não encontrado" });
        }
        return res.json(post);
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
        const posts = await Post.search(query);
        if (posts.length === 0) {
            return res.status(404).json({ message: "Nenhum post encontrado para este termo." });
        }
        return res.json(posts);
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao buscar posts." });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const { titulo, conteudo, autor } = req.body;
        if (!titulo || !conteudo || !autor) {
            return res.status(400).json({ message: "Título, conteúdo e autor são obrigatórios." });
        }
        const newPost: IPost = { titulo, conteudo, autor };
        const createdPost = await Post.create(newPost);
        return res.status(201).json({ 
            message: "Post criado com sucesso! 🚀", 
            post: createdPost 
        });
    } catch (error) {
        if (isValueTooLong(error)) {
            return res.status(400).json({ message: TAMANHO_EXCEDIDO });
        }
        console.error("Erro ao criar post:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao criar o post." });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const { titulo, conteudo, autor } = req.body;
        const updatedPostData: IPost = { titulo, conteudo, autor };
        const updatedPost = await Post.update(id, updatedPostData);
        if (!updatedPost) {
            return res.status(404).json({ message: "Post não encontrado" });
        }
        return res.json({
            message: "Post atualizado com sucesso!",
            post: updatedPost
        });
    } catch (error) {
        if (isValueTooLong(error)) {
            return res.status(400).json({ message: TAMANHO_EXCEDIDO });
        }
        console.error("Erro ao atualizar post:", error);
        return res.status(500).json({ message: "Erro interno no servidor ao atualizar o post." });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const idParam = req.params.id;
        if (typeof idParam !== "string") {
            return res.status(400).json({ message: "ID inválido." });
        }
        const id = parseInt(idParam, 10);
        const success = await Post.delete(id);
        if (!success) {
            return res.status(404).json({ message: "Post não encontrado para exclusão." });
        }
        return res.json({ message: "Post deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar post:", error);
        res.status(500).json({ message: "Erro interno no servidor ao deletar o post." });
    }
};