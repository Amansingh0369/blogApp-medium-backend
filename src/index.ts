import express, { Request, Response } from 'express';

const app = express();
app.use(express.json())

// Define a simple route
app.post('/api/v1/user/signup', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.post('/api/v1/user/signin', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.post('//api/v1/blog', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.put('/api/v1/blog', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.get('/api/v1/blog/:id', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.get('/api/v1/blog/bulk', (req: Request, res: Response) => {
    res.send('Hello, World!');
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
