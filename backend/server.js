// server.js
import 'dotenv/config';
import app from './app.js';
import { connectMongoDB } from './database/mongodb.js';

const PORT = process.env.PORT || 3000;

try {
    await connectMongoDB();
    app.listen(PORT, () => {
        console.log(`BoTema API en http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
}
