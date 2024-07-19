import { Request as ExpressRequest, Response } from 'express';

const handleAuth = async (req: ExpressRequest, res: Response) => {
    try {
        const { Auth } = await import('@auth/core');  // Dynamically import @auth/core
        const authConfig = (await import('../config.js')).default; // Dynamically import config

        const headers = new Headers();
        for (const headerName in req.headers) {
            const headerValue: string = req.headers[headerName]?.toString() ?? "";
            if (Array.isArray(headerValue)) {
                for (const value of headerValue) {
                    headers.append(headerName, value);
                }
            } else {
                headers.append(headerName, headerValue);
            }
        }

        const request = new Request(req.protocol + '://' + req.get('host') + req.originalUrl, {
            method: req.method,
            headers: headers,
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
        res.status(500).send('Authentication error');
    }
};

export { handleAuth };
