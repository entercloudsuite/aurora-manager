export interface Request {
    protocol: string;
    host: string;
    port: number;
    path: string;
    method: string;
    headers: {};
    body?: {};
}