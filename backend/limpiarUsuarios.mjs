// limpiarUsuarios.mjs — borra todos los usuarios MENOS los de CONSERVAR.
// Uso:
//   node limpiarUsuarios.mjs            -> SOLO muestra a quiénes borraría (vista previa)
//   node limpiarUsuarios.mjs --confirm  -> borra de verdad
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongoDB } from './database/mongodb.js';
import { User } from './models/user.model.js';

// 👇 Poné acá los usuarios que querés CONSERVAR (por username)
const CONSERVAR = ['giancarlo.bernasconi', 'liam.texeira'];

const filtro = { username: { $nin: CONSERVAR } };
const confirmar = process.argv.includes('--confirm');

await connectMongoDB();

const aBorrar = await User.find(filtro).select('username email');
console.log(`\nSe CONSERVAN: ${CONSERVAR.join(', ')}`);
console.log(`Usuarios que ${confirmar ? 'se van a BORRAR' : 'se borrarían'} (${aBorrar.length}):`);
aBorrar.forEach((u) => console.log('  -', u.username, `(${u.email})`));

if (confirmar) {
    const res = await User.deleteMany(filtro);
    console.log(`\n✅ Borrados: ${res.deletedCount}`);
} else {
    console.log('\n(VISTA PREVIA) No se borró nada. Corré con  --confirm  para borrar de verdad.');
}

await mongoose.disconnect();
