"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://blog-app-medium-frontend.vercel.app",
        "https://blog-app.amansingh0369.me",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
const prisma = new client_1.PrismaClient();
const jwt = jsonwebtoken_1.default;
// Signup Route
app.post('/api/v1/user/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const user = yield prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password,
            },
        });
        // @ts-ignore
        const token = jwt.sign({ id: user.id }, "blog");
        res.json({
            msg: "User is created",
            token,
        });
    }
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            error: "Error while signup",
        });
    }
}));
// Signin Route
app.post('/api/v1/user/login', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const user = yield prisma.user.findUnique({
                where: {
                    email: body.email,
                },
            });
            if (!user) {
                res.json({
                    error: "user not found",
                });
            }
            //@ts-ignore
            const token = jwt.sign({ id: user.id }, "blog");
            res.json({
                msg: "Login successfully",
                token,
                email: body.email,
            });
        }
        catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({
                error: "Error while login",
            });
        }
    });
});
// Blog Routes
// @ts-ignore
app.post('/api/v1/blog', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const userId = req.userId; // Access the userId from req
        const post = yield prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId, // Use the userId from the middleware
            }
        });
        res.json({
            msg: 'Post Blog!',
            id: post.id
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
}));
app.get('/api/v1/post/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany();
        res.json({
            posts
        });
    }
    catch (e) {
        console.log(e);
        res.status(411).json({
            msg: "cant fetch blog post from server",
        });
    }
}));
app.put('/api/v1/blog/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const body = req.body;
    try {
        const userId = req.userId; // Access the userId from req
        const post = yield prisma.post.update({
            where: {
                id: id,
            },
            data: {
                title: body.title,
                content: body.content,
            }
        });
        res.json({
            msg: 'updated Blog!',
            id: post.id
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update post' });
    }
}));
app.get('/api/v1/blog/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const userId = req.userId; // Access the userId from req
        const post = yield prisma.post.findFirst({
            where: {
                id: id,
            }
        });
        res.json({
            post
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error while fetching blog post' });
    }
}));
// Middleware to authenticate and attach user info to req
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        try {
            // Verify JWT
            const user = yield jwt.verify(authHeader, "blog");
            if (user) {
                // Attach user id to req
                req.userId = user.id;
                next();
            }
            else {
                res.status(401).json({ error: 'you are not logged in' });
            }
        }
        catch (error) {
            res.status(401).json({ error: 'Token verification failed' });
        }
    });
}
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
