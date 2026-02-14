import { Post } from "../models/post";
import { Request, Response } from "express";

const posts: Post[] = [
  {
    idPost: 1,  
    titulo: "Primeiro Post",
    conteudo: "Este é o conteúdo do primeiro post.",
    idAutor: 1,
    dataCriacao: new Date("2024-01-01")
  },
  {
    idPost: 2,
    titulo: "Segundo Post",
    conteudo: "Este é o conteúdo do segundo post.",
    idAutor: 2,
    dataCriacao: new Date("2024-01-02")
  }
];

export const getPosts = (req: Request, res: Response) => {
    return res.json(posts);
};