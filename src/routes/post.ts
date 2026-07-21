import { Router } from "express";
import { createPost, deletePost, getAdminPosts, getPostById, getPosts, getSearchPosts, updatePost } from "../controllers/post";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Definimos "/" aqui porque este grupo de rotas será
// "pendurado" no caminho "/posts" no servidor principal

// Leitura é pública: alunos navegam sem login.
router.get("/", getPosts);

router.get("/search", getSearchPosts);

// Precisa vir antes de "/:id", senão "admin" seria tratado como um id.
router.get("/admin", requireAuth, getAdminPosts);

router.get("/:id", getPostById);

// Escrita é restrita a professores autenticados.
router.post("/", requireAuth, createPost);

router.put("/:id", requireAuth, updatePost);

router.delete("/:id", requireAuth, deletePost);

export default router;
