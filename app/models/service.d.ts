export interface Service {
    id: string,
    host: string;
    port: number;
    name: string;
    state?: string;
    routingPath: string;
    options: {};

    toJSON(): {};
}