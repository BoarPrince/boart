import { ASTVariable } from '../parser/ast/ASTVariable';
import { Pipe } from '../parser/ast/Pipe';
import { ParaDescription } from './ParaDescription';
import { PipeHandler } from './PipeHandler';

/**
 *
 */
export class PipeResolver {
    /**
     *
     */
    constructor(private readonly handler = PipeHandler.instance) {}

    /**
     *
     */
    private checkPara(paraDescs: ParaDescription[], pipeDefinition: Pipe): void {
        if (!paraDescs) {
            return;
        }

        const paraValues = pipeDefinition.paras;
        if (paraDescs.length !== paraValues?.length) {
            throw Error(`${paraDescs.length} para(s) expected, but ${paraValues?.length || 0} found`);
        }

        paraDescs.forEach((paraDesc, index) => {
            const paraValue = paraValues[index];
            // boolean
            if (paraDesc.type === 'boolean' && !['true', 'false'].includes(paraValue?.toLowerCase())) {
                throw Error(`para #${index}'${paraDesc.desc}' must be a boolean, but has the value '${paraValue}'`);
                // number
            } else if (paraDesc.type === 'number' && isNaN(parseInt(paraValue))) {
                throw Error(`para #${index}'${paraDesc.desc}' must be a number, but has the value '${paraValues}'`);
            }
        });
    }

    /**
     *
     */
    private transformPara(paraDescs: ParaDescription[], paraValues: string[]): Array<number | string | boolean> {
        if (!paraDescs) {
            return paraValues;
        }

        return paraDescs.map((paraDesc, index) => {
            const paraValue = paraValues[index];
            // boolean
            if (paraDesc.type === 'boolean') {
                return paraValue.toLowerCase() === 'true';
                // number
            } else if (paraDesc.type === 'number') {
                return parseInt(paraValue);
            } else {
                return paraValue;
            }
        });
    }

    /**
     *
     */
    public resolve(value: string, pipeDefinition: Pick<ASTVariable, 'pipes' | 'match'>): string {
        let resolvedValue = value;
        for (const pipeDef of pipeDefinition.pipes || []) {
            const pipe = this.handler.get(pipeDef.name);
            if (!pipe) {
                throw Error(`pipe '${pipeDef.name}' does not exist`);
            }

            try {
                this.checkPara(pipe.paraDesc, pipeDef);
            } catch (err) {
                throw Error(`${err}\n--> '${pipeDefinition.match}'`);
            }
            const args = this.transformPara(pipe.paraDesc, pipeDef.paras) || [];

            resolvedValue = pipe.run(resolvedValue, ...args);
        }

        return resolvedValue;
    }
}
