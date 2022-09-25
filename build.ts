import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';

/**
 *
 */
interface CommandLineOptions {
    /**
     * action
     */
    a: string;
    /**
     * package name
     */
    p: Array<string>;
    /**
     * remove parent dist folder for specified package
     */
    r: boolean;
    /**
     * ressource file
     */
    f?: string;
}

/**
 *
 */
enum Actions {
    // prepare dist
    CopyToPackageDist = 'cpd',
    // copy to node modules
    CopyToNodeModules = 'cnm',
    // copy a ressource file from dist package to node modules
    CopyRessourceToNodeModules = 'crnm',
    // remove root dist
    RemoveRootDist = 'rrd'
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
    get packageNames(): Array<string> {
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
    get ressourceFile(): string | undefined {
        return this.options.f;
    }

    /**
     *
     */
    get action(): string {
        return this.options.a;
    }

    /**
     *
     */
    static parse(): CommandLineReader {
        const options = yargs(process.argv.slice(2))
            .options({
                a: {
                    type: 'string',
                    choices: Object.values(Actions),
                    alias: 'action',
                    require: true,
                    desc: 'Action that shall be executed'
                },
                p: {
                    type: 'string',
                    array: true,
                    choices: ['core', 'core-impl', 'basic', 'protocol', 'execution'],
                    alias: 'packageName',
                    require: true,
                    desc: 'Name of the package(s)'
                },
                r: {
                    boolean: true,
                    alias: 'removeRootDist',
                    default: false,
                    implies: 'p',
                    desc: 'Remove the root dist folder of the package'
                },
                f: {
                    type: 'string',
                    alias: 'ressourceFile',
                    implies: 'p',
                    desc: 'ressource file '
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
    private getRootPackageDistDir(packageName: string): string {
        return path.resolve(__dirname, 'dist', packageName);
    }

    /**
     * dir name of the root package dist folder
     */
    private getNodeModulesPackgeDir(packageName: string): string {
        return path.resolve(__dirname, 'src', 'gauge', 'node_modules', '@boart', packageName);
    }

    /**
     * dir name of the root package dist folder
     */
    private getPackageDistDir(packageName: string): string {
        return path.resolve(__dirname, 'src', 'packages', packageName, 'dist');
    }

    /**
     * dir name of the source package folder
     */
    private getPackageSourceDir(packageName: string): string {
        return path.resolve(__dirname, 'src', 'packages', packageName);
    }

    /**
     *
     */
    removeRootDist(): void {
        this.commandLine.packageNames.forEach((packageName) => {
            fs.rmSync(this.getRootPackageDistDir(packageName), { recursive: true, force: true });
        });
    }

    /**
     *
     */
    copyToPackageDist(): void {
        this.commandLine.packageNames.forEach((packageName) => {
            fs.cpSync(path.resolve(this.getRootPackageDistDir(packageName), 'src'), this.getPackageDistDir(packageName), {
                recursive: true
            });
        });
    }

    /**
     *
     */
    removeNodeModulesPackage(): void {
        this.commandLine.packageNames.forEach((packageName) => {
            fs.rmSync(this.getNodeModulesPackgeDir(packageName), { recursive: true, force: true });
        });
    }

    /**
     *
     */
    copyToNodeModulesPackage(): void {
        this.commandLine.packageNames.forEach((packageName) => {
            fs.cpSync(this.getRootPackageDistDir(packageName), this.getNodeModulesPackgeDir(packageName), {
                recursive: true
            });
        });
    }

    /**
     *
     */
    copyRessourceToNodeModulesPackage(): void {
        const ressourceFile = this.commandLine.ressourceFile;
        if (!ressourceFile) {
            return;
        }

        this.commandLine.packageNames.forEach((packageName) => {
            fs.cpSync(
                path.join(this.getPackageSourceDir(packageName), ressourceFile),
                path.join(this.getNodeModulesPackgeDir(packageName), ressourceFile)
            );
        });
    }

    /**
     *
     */
    addPackageJsonToNodeModulesPackage(): void {
        this.commandLine.packageNames.forEach((packageName) => {
            fs.writeFileSync(
                path.resolve(this.getNodeModulesPackgeDir(packageName), 'package.json'),
                `{
            "name": "@boart/${packageName}",
            "main": "src/index.js",
            "types": "src/index.d.ts"
          }`
            );
        });
    }
}

const args = CommandLineReader.parse();
const helper = new BuildHelper(args);

switch (args.action) {
    case Actions.CopyToPackageDist:
        helper.copyToPackageDist();
        break;
    case Actions.RemoveRootDist:
        helper.removeRootDist();
        break;
    case Actions.CopyToNodeModules:
        helper.removeNodeModulesPackage();
        helper.copyToNodeModulesPackage();
        helper.addPackageJsonToNodeModulesPackage();
        break;
    case Actions.CopyRessourceToNodeModules:
        helper.copyRessourceToNodeModulesPackage();
        break;
}
