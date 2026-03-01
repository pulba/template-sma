// src/pages/api/pendaftaran/list.ts
import type { APIRoute } from 'astro';
import { getAllUsers } from '../../../lib/db';

export const GET: APIRoute = async () => {
    try {
        const result = await getAllUsers();
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
