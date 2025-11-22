import express from 'express';
const router = express.Router();

import {query} from '../db.js'

//Services
import { generateUniqueCode } from '../services/code.service.js';
import { isValidURL } from '../services/url.service.js';
import { getDefaultResultOrder } from 'dns';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

router.post('/link', async (req, res) => {
    try {
        const { targetUrl } = req.body;

        let {code } = req.body;

        if(!targetUrl)
            return res.status(400).json({error : "target_url is required"});

        if(!isValidURL(targetUrl))
            return res.status(400).json({error : "invalid target_url"});

        if (code){
            if(!CODE_REGEX.test(code)){
            return res.status(400).json({ error : "code must match  [A-Za-z0-9]{6,8}"});
            }

            const exists = await query('SELECT 1 FROM links WHERE code=$1', [code]);

            if(exists.rowCount){
                return res.status(409).json({error : "code exists"});
            }
        } else {
            code = await generateUniqueCode();
        }

        const insert = await query(
            'INSERT INTO links (code, target_url) VALUES ($1, $2) RETURNING code, target_url, clicks, last_clicked, created_at',
            [code,targetUrl]
        );

        return res.status(201).json({ 
            message : "Short code successfully generated",
            data : insert.rows[0]
        })  
    } catch (error) {
        console.error("POST /api/link", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/link', async (req,res) => {
    try {
        const result = await query ('SELECT code, target_url, clicks, last_clicked, created_at FROM links WHERE NOT deleted ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error("GET /api/link", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/link/:code', async (req, res) => {
    try {
        const {code} = req.params;

        const result = await query('SELECT code, target_url, clicks, last_clicked, created_at FROM links WHERE code =$1 AND NOT deleted', [code]);

        if(result.rowCount === 0)
            return res.status(404).json({error : "not found"});

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Get /api/link/:code', error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.delete('/link/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const result = await query( 'UPDATE links SET deleted=TRUE WHERE code =$1 AND NOT deleted RETURNING code', [code]);

        if(result.rowCount === 0 )
            return res.status(404).json({error : "Not found"})
        
        return res.status(204).json({
            message : "Successfully deleted"
        });
    } catch (error) {
        console.error("DELETE /api/link/:code", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/:code', async (req,res) => {
    const {code} = req.params;
    try {
        const result = await query(
            'UPDATE links SET clicks = clicks +1, last_clicked = NOW() WHERE code = $1 AND NOT deleted RETURNING target_url', [code]);
        
        if( result.rowCount === 0)
            return res.status(400).json({error : "Not found"});

        const target = result.rows[0].target_url;
        res.redirect(302, target);

    } catch (error) {
        console.log("GET /api/:code", error);
        return res.status(500).json({error : "Internal Server Error"});
    }
})

export default router;