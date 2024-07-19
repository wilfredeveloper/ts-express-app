// src/controllers/authController.ts
import { Request as ExpressRequest, Response } from 'express';

const handleAuth = async (req: ExpressRequest, res: Response) => {
    try {
        const { Auth } = await import('@auth/core');
        const { default: authConfig } = await import('../config.js');

        const headers = new Headers();
        for (const headerName in req.headers) {
            const headerValue = req.headers[headerName];
            if (Array.isArray(headerValue)) {
                headerValue.forEach(value => headers.append(headerName, value));
            } else if (headerValue) {
                headers.append(headerName, headerValue);
            }
        }

        const request = new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
            method: req.method,
            headers,
            body: req.body
        });

        const response = await Auth(request, authConfig);

        res.status(response.status);
        res.contentType(response.headers.get("content-type") ?? "text/plain");
        response.headers.forEach((value, key) => {
            if (value) {
                res.setHeader(key, value);
            }
        });
        const body = await response.text();
        res.send(body);
    } catch (error) {
        res.status(500).send('Authentication error'+error);
        console.error(error);
    }
};

export { handleAuth };
