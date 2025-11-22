import crypto from 'crypto';
import pool, {query} from '../db.js'

function getRandomCode(len=6){
    return crypto.randomBytes(Math.ceil(len * 3/4)).toString('base64')
        .replace(/\+/g, '0').replace(/\//g, '0').replace(/=+$/,'')
        .slice(0,len);
}

export async function generateUniqueCode(){
    for(let i=0; i<6; i++) {
        const len =6 + Math.floor(Math.random()*3);
        const code = getRandomCode(len);
        const r = await query ('SELECT 1 FROM links WHERE code=$1', [code]);
        if (r.rowCount ===0 )
            return code
    }
    throw new Error('Unable to generate unique code')
}