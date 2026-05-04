export declare class NokoServer {
    private server;
    constructor(name?: string);
    run(): Promise<void>;
}
export declare function runServer(): void;
