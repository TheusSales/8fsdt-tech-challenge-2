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

// Esta função é um exemplo de como lidar com uma rota que retorna todos os posts.
export const getPosts = (req: Request, res: Response) => {
    return res.json(posts);
};

// Esta função é um exemplo de como lidar com uma rota que recebe um parâmetro de ID para buscar um post específico.
export const getPostById = (req: Request, res: Response) => {
    // Para lidar com o caso em que o ID pode ser passado como string ou array (dependendo de como a rota é definida), fazemos essa verificação.
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    // Convertendo o ID para número, já que os IDs dos posts são do tipo number.
    const id = parseInt(idParam || "0");
    const post = posts.find(p => p.idPost === id);
    if (post) {
        return res.json(post);
    }
    return res.status(404).json({ message: "Post não encontrado" });
};

export const getSearchPosts = (req: Request, res: Response) => {
    const query = req.query.q as string;

    const filteredPosts = posts.filter(post => 
        post.titulo.toLowerCase().includes(query.toLowerCase()) || 
        post.conteudo.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredPosts.length === 0) {
        return res.status(404).json({ message: "Nenhum post encontrado para este termo." });
    }

    return res.json(filteredPosts);
};

export const createPost = (req: Request, res: Response) => {
    //Extraindo os dados do corpo da requisição para criar um novo post.
    const titulo = req.body.titulo;
    const conteudo = req.body.conteudo;
    const idAutor = req.body.idAutor;
    const idPost = posts.length + 1; // Gerando um ID simples baseado no tamanho do array, apenas para fins de demonstração.
    const dataCriacao = new Date(); // Definindo a data de criação como a data atual.

    const newPost: Post = {
        idPost,
        titulo,
        conteudo,
        idAutor,
        dataCriacao
    };

    posts.push(newPost);

    //montando a resposta com os dados recebidos, apenas para fins de demonstração. Em um cenário real, você provavelmente iria salvar esses dados em um banco de dados e retornar o post criado com um ID gerado.
    res.status(201).json({ ...newPost, message: "Post criado com sucesso!" });
}

export const updatePost = (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam || "0");
    const postIndex = posts.findIndex(p => p.idPost === id);
    if (postIndex === -1) {
        return res.status(404).json({ message: "Post não encontrado" });
    }
    const updatedPost = { ...posts[postIndex], ...req.body };
    posts[postIndex] = updatedPost;
    res.json(updatedPost);
}

export const deletePost = (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam || "0");
    const postIndex = posts.findIndex(p => p.idPost === id);
    if (postIndex === -1) {
        return res.status(404).json({ message: "Post não encontrado" });
    }
    posts.splice(postIndex, 1);
    res.json({ message: "Post deletado com sucesso!" });
}