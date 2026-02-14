import { Router } from "express";
import { getPosts } from "../controllers/post";

const router = Router();

// Definimos "/" aqui porque este grupo de rotas será 
// "pendurado" no caminho "/posts" no servidor principal
router.get("/", getPosts);

export default router;