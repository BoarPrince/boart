import { Initializer } from "../common/Initializer";
import { Pipe } from "./Pipe";

/**
 * 
 */
export class PipeHandler implements Initializer<Pipe> {
    private pipes: Array<Pipe>;

    /**
     *
     */
    private constructor() {
        this.pipes = [];
    }

    /**
     *
     */
    public static get instance(): PipeHandler {
        if (!globalThis._pipeHandlerInstance) {
            const instance = new PipeHandler();
            globalThis._pipeHandlerInstance = instance;
        }
        return globalThis._pipeHandlerInstance;
    }

    /**
     * 
     */
    public get list(): ReadonlyArray<Pipe> {
        return this.pipes;
    }

    /**
     *
     */
    public clear() {
        this.pipes = [];
    }

    /**
     *
     */
    public delete(name: string) {
        this.pipes = this.pipes.filter((r) => r.name === name);
    }

    /**
     * 
     */
    public get(name: string): Pipe {
        return this.pipes.find((r) => r.name === name);
    }
    
    /**
     *
     */
    public add(name: string, item: Pipe): Initializer<Pipe> {
        if (this.pipes.find((r) => r.name === name)) {
            throw Error(`pipe '${name}' already exists!`);
        }
        

        this.pipes.push(item);
        return this;
    }

    /**
     *
     */
    public addItems(pipes: readonly Pipe[]): Initializer<Pipe> {
        pipes?.forEach((r) => this.add(r.name, r));
        return this;
    }
}