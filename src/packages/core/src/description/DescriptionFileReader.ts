import fs from 'fs';
import path from 'path';
import { Description } from './Description';
import { DescriptionParser } from '../parser/DescriptionParser';
import { ASTDescription, ASTUnitDescription } from '../parser/ast/ASTDescription';
import { DescriptionFileNotFounError } from './DescriptionFileNotFounError';

/**
 *
 */
export class DescriptionFileReader {
    /**
     *
     */
    static get instance(): DescriptionFileReader {
        if (!globalThis._descriptionFileReaderInstance) {
            const instance = new DescriptionFileReader();
            globalThis._descriptionFileReaderInstance = instance;
        }
        return globalThis._descriptionFileReaderInstance;
    }

    /**
     *
     */
    private getCallerPath(): string {
        // Create an Error to capture the stack trace
        const stack = new Error().stack;
        // Split the stack trace into lines and find the caller
        const stackLines = stack
            .split('\n') //
            .filter((line) => line.match(/^\s+at/))
            .filter((line) => !line.includes(__dirname));

        // Extract the file path of the caller
        const pathRegex = /\((.*?):\d+:\d+\)$/;
        const match = stackLines[0].match(pathRegex);
        if (match?.[1]) {
            return path.dirname(match[1]);
        } else {
            return null;
        }
    }

    /**
     *
     */
    private getDescriptionUnit(fileName: string, description: ReadonlyArray<ASTUnitDescription>, unit: string): ASTDescription {
        const descriptionUnit = description.find((desc) => desc.unit === unit);

        if (!descriptionUnit) {
            throw new Error(`unit '${unit}' not found in description '${fileName}'`);
        }

        return descriptionUnit.desc;
    }

    /**
     *
     */
    public readDescription(fileName: string, unit?: string): Description {
        const file = path.parse(fileName);
        const pathName = !file.dir ? this.getCallerPath() : file.dir;
        const name = file.name;

        const fileAndPath = path.join(pathName, name) + '.desc';

        if (!fs.existsSync(fileAndPath)) {
            throw new DescriptionFileNotFounError(`file '${fileAndPath}' does not exist`);
        }

        const description = fs.readFileSync(fileAndPath, 'utf8');
        const parser = new DescriptionParser();
        const ast = parser.parse(description);

        const getDesc = () => {
            if (Array.isArray(ast)) {
                throw new Error(`description of file '${fileAndPath}' is a unit description, but unit definition is missing`);
            }
            return ast as ASTDescription;
        };
        const desc = !unit ? getDesc() : this.getDescriptionUnit(fileAndPath, ast as ReadonlyArray<ASTUnitDescription>, unit);

        return {
            id: desc.id,
            parentId: null,
            title: desc.title,
            titleShort: desc.titleShort ?? desc.title,
            dataScopes: null,
            description: desc.desc?.join('\n'),
            examples: desc.examples?.map((example) => ({
                title: example.title,
                example: example.text?.join('\n'),
                codes: example.codes.map((code) => ({
                    title: code.title,
                    titleShort: code.title,
                    type: code.type,
                    position: code.position,
                    code: code.code?.join('\n')
                }))
            }))
        };
    }
}
