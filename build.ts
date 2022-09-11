import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';

/**
 *
 */
interface CommandLineOptions {
    /**
     * package name
     */
    p: string;
    /**
     * remove parent dist folder for specified package
     */
    r: boolean;
}

/**
 *
 */
class CommandLineReader {
    /**
     *
     * @param options constains the command line arguments from yargs
     */
    constructor(private options: CommandLineOptions) {}

    /**
     *
     */
    get packageName(): string {
        return this.options.p;
    }

    /**
     *
     */
    get removeParentDist(): boolean {
        return this.options.r;
    }

    /**
     *
     */
    static parse(): CommandLineReader {
        const options = yargs(process.argv.slice(2))
            .options({
                p: {
                    type: 'string',
                    choices: ['core', 'core-impl', 'basic', 'protocol', 'execution'],
                    alias: 'packageName',
                    require: true,
                    desc: 'Name of the package'
                },
                r: {
                    boolean: true,
                    alias: 'removeRootDist',
                    default: false,
                    implies: 'p',
                    desc: 'Remove the root dist folder of the package'
                }
            })
            .parseSync();

        return new CommandLineReader(options);
    }
}

/**
 *
 */
class BuildHelper {
    /**
     *
     * @param commandLine
     */
    constructor(private commandLine: CommandLineReader) {}

    /**
     * dir name of the root package dist folder
     */
    private get rootPackageDistDir(): string {
        return path.resolve(__dirname, 'dist', this.commandLine.packageName);
    }

    /**
     * dir name of the root package dist folder
     */
    private get packageDistDir(): string {
        return path.resolve(__dirname, 'src', 'packages', this.commandLine.packageName, 'dist');
    }

    /**
     *
     */
    removeRootDist(): void {
        fs.rmSync(this.rootPackageDistDir, { recursive: true, force: true });
    }

    /**
     *
     */
    copyToPackageDist(): void {
        fs.cpSync(path.resolve(this.rootPackageDistDir, 'src'), this.packageDistDir, { recursive: true });
    }
}

console.log(process.env['npm_package_json']);

const args = CommandLineReader.parse();
const helper = new BuildHelper(args);

if (args.removeParentDist) {
    helper.removeRootDist();
} else {
    helper.copyToPackageDist();
}
