import { Server } from 'http';
import { AddressInfo } from 'net';

import * as BodyParser from 'body-parser';
import * as express from 'express';
import { Express } from 'express-serve-static-core';


/**
 *
 */
export class RestServer {
    private app: Express;
    private server: Server;
    private static instances = new Map<number, RestServer>();

    /**
     *
     */
    constructor() {
        this.app = express.default();
        this.init();
    }

    /**
     *
     */
    public static getInstance(port = 8081) {
        let instance = RestServer.instances.get(port);
        if (!instance) {
            instance = new RestServer();
            RestServer.instances.set(port, instance);
            instance.start(port);
        }
        return instance;
    }

    /**
     *
     */
    public static stop() {
        RestServer.instances.forEach((instance) => instance.server.close());
    }

    /**
     *
     */
    public get(path: string, handler: (request, response) => any) {
        this.app.get(path, handler);
    }

    /**
     *
     */
    public post(path: string, handler: (request, response) => any) {
        this.app.post(path, handler);
    }

    /**
     *
     */
    public delete(path: string, handler: (request, response) => any) {
        this.app.delete(path, handler);
    }

    /**
     *
     */
    public put(path: string, handler: (request, response) => any) {
        this.app.put(path, handler);
    }

    /**
     *
     */
    private init() {
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            next();
        });

        this.app.use(BodyParser.urlencoded({ extended: true }));
        this.app.use(BodyParser.json());
    }

    /**
     *
     */
    private start(port: number): void {
        this.server = this.app.listen(port, () => {
            const addressInfo: AddressInfo = this.server.address() as AddressInfo;
            console.log(`Mock Server listening at http://${addressInfo.address}:${addressInfo.port}`);
        });
    }
}
