import fs from 'fs';
import fsPath from 'path';

/**
 *
 */
export class ConfigurationLookup {
    /**
     *
     */
    constructor(private rootPath: string) {}

    /**
     *
     */
    public lookup(): Array<string> {
        return this.rootPath.split(/\s*,\s*/).reduce((files, path) => {
            return files.concat(ConfigurationLookup.lookup(fsPath.resolve(path)));
        }, new Array<string>());
    }

    /**
     *
     */
    private static pathExists(path: string): boolean {
        try {
            return fs.lstatSync(path).isDirectory();
        } catch (error) {
            return false;
        }
    }

    /**
     *
     */
    private static lookup(rootPath: string): Array<string> {
        const fileNameConfigRegexp = /^boart(\.(?<name>[^.]+))?.json$/;
        const foundConfigs = new Array<string>();

        if (!this.pathExists(rootPath)) {
            throw new Error(`Read configuration: path '${rootPath}' does not exist`);
        }

        const extensionPaths = fs
            .readdirSync(rootPath) //
            .map((path) => fsPath.join(rootPath, path))
            .filter((path) => fs.statSync(path).isDirectory());

        for (const extensionPath of extensionPaths) {
            const boartConfigFiles = fs
                .readdirSync(extensionPath) //
                .map((file) => fsPath.join(extensionPath, file))
                .filter((file) => {
                    const fileName = fsPath.basename(file);
                    return fileName.match(fileNameConfigRegexp) && fs.statSync(file).isFile();
                });
            foundConfigs.push(...boartConfigFiles);
        }

        return foundConfigs;
    }
}
