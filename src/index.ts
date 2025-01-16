import express, {NextFunction, Request, Response} from "express";
import {PrismaClient} from "@prisma/client";
import jsonwebtoken from "jsonwebtoken";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://blog-app-medium-frontend.vercel.app",
            "https://blog-app.amansingh0369.me",
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

const prisma = new PrismaClient();
const jwt = jsonwebtoken;


// Signup Route
app.post('/api/v1/user/signup', async (req: Request, res: Response) => {
    const body = req.body;

    try {
        const user = await prisma.user.create({
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
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            error: "Error while signup",
        });
    }
});

// Signin Route
app.post('/api/v1/user/login', async function(req: Request, res: Response) {

    try {
        const body = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });
        if(!user){
            res.json({
                error:"user not found",
            })
        }
        //@ts-ignore
        const token = jwt.sign({ id: user.id }, "blog");
        res.json({
            msg: "Login successfully",
            token,
            email: body.email,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            error: "Error while login",
        });
    }
});

// Blog Routes

// @ts-ignore
app.post('/api/v1/blog', authMiddleware , async (req: Request, res: Response) => {
    const body = req.body;

    try {
        const userId = (req as any).userId; // Access the userId from req
        const post = await prisma.post.create({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});


app.get('/api/v1/post/bulk', async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include:{
                author : true
            }
        });

        res.status(200).json({
            posts,
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({
            msg: "Unable to fetch blog posts from the server. Please try again later.",
        });
    }
});


app.put('/api/v1/blog/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = req.body;
    try {
        const userId = (req as any).userId; // Access the userId from req
        const post = await prisma.post.update({
            where:{
                id:id,
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});


app.get('/api/v1/blog/:id', async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const userId = (req as any).userId; // Access the userId from req
        const post = await prisma.post.findFirst({
            where:{
                id:id,
            }
        });

        res.json({
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error while fetching blog post' });
    }
});



// Middleware to authenticate and attach user info to req
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    try {
        // Verify JWT
        const user = await jwt.verify(authHeader, "blog") as { id: string };

        if (user) {
            // Attach user id to req
            (req as any).userId = user.id;
            next();
        } else {
            res.status(401).json({ error: 'you are not logged in' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Token verification failed' });
    }
}


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
