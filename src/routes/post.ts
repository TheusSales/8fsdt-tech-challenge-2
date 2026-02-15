import { Router } from "express";
import { createPost, deletePost, getPostById, getPosts, getSearchPosts, updatePost } from "../controllers/post";

const router = Router();

// Definimos "/" aqui porque este grupo de rotas será 
// "pendurado" no caminho "/posts" no servidor principal
router.get("/", getPosts);

router.get("/:id", getPostById);

router.get("/search", getSearchPosts);

router.post("/",createPost);

router.put("/:id",updatePost);

router.delete("/:id",deletePost);

export default router;