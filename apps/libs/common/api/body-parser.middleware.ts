import { Request, Response, NextFunction } from 'express';

export function bodyParserMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.body instanceof Buffer) {
        try {
            req.body = JSON.parse(req.body.toString());
        } catch (err) {
            console.log('Request body is not in JSON format');
        }
    }
    next();
}
