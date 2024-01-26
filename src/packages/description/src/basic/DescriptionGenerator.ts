import * as fs from 'fs';
import * as path from 'path';

import { EnvLoader, FullDescription } from '@boart/core';

import { ChildMap } from '../util/ChildMap';

import { DescriptionCreatorFactory } from './DescriptionCreatorFactory';
import { DescriptionLinkReference } from './DescriptionLinkReference';
import { ExpectedConverter } from '../converter/ExpectedConverter';
import { TemplateEngine } from '../util/TemplateEngine';

/**
 *
 */
export class DescriptionGenerator {
    private description: FullDescription;
    private converters = new Array<DescriptionCreatorFactory>();
    private templateGenerator: TemplateEngine;

    /**
     *
     */
    private constructor() {
        // singleton
    }

    /**
     *
     */
    public static get instance(): DescriptionGenerator {
        if (!globalThis._descriptionGeneratorInstance) {
            const instance = new DescriptionGenerator();
            globalThis._descriptionGeneratorInstance = instance;
            instance.init();
        }
        return globalThis._descriptionGeneratorInstance;
    }

    /**
     *
     */
    private init(): void {
        const searchPath = path.resolve(__dirname, '..', '..', 'resources');
        this.templateGenerator = new TemplateEngine(searchPath);
        this.description = this.read();

        // init converter factories
        this.converters.push(ExpectedConverter.factory);
    }

    /**
     *
     */
    private read(): FullDescription {
        const fileName = EnvLoader.instance.mapDescriptionData('description.json');
        const description: string = fs.readFileSync(fileName, { encoding: 'utf-8' });
        return JSON.parse(description);
    }

    /**
     *
     */
    private copyResources(files: string[]) {
        for (const file of files) {
            const source = path.resolve(__dirname, '..', '..', 'resources', file);
            const destination = EnvLoader.instance.mapDescriptionData(file);
            fs.cpSync(source, destination);
        }
    }

    /**
     * maps the correct link refence for all occurances
     */
    private static mapReference(htmlContent: string, linkReferenceMap: Map<string, DescriptionLinkReference>): string {
        const refRegExp = /<a href="ref:([^"]+)">ref:([^"]+)<\/a>/g;
        return htmlContent.replace(refRegExp, (_, refId: string) => {
            const reference = linkReferenceMap.get(refId) || '';
            if (!reference) {
                return '';
            }
            return `<a href="${reference.marker}">${reference.desc.title}</a>`;
        });
    }

    /**
     *
     */
    create(): void {
        const converters = this.converters.map((factory) => ({
            converter: factory.create(this.templateGenerator.env, this.description),
            templateName: factory.resourceName + '.njk',
            fileAndPathName: EnvLoader.instance.mapDescriptionData(factory.resourceName + '.html'),
            filename: factory.resourceName + '.html'
        }));

        const linkReferenceMap = new Map<string, DescriptionLinkReference>();
        const childMap = new ChildMap();

        // create link reference list for all descriptions
        converters.forEach((converter) => {
            converter.converter.addLinkReference(converter.filename, linkReferenceMap);
            converter.converter.populateChildMap(childMap);
        });

        this.templateGenerator.addChildsFilter(childMap);
        this.templateGenerator.addRefFilter(linkReferenceMap);

        // use template engine to create documentations
        converters.forEach((converter) => {
            const content = converter.converter.create(converter.templateName);
            const contentWithMappedRefs = DescriptionGenerator.mapReference(content, linkReferenceMap);
            fs.writeFileSync(converter.fileAndPathName, contentWithMappedRefs, 'utf-8');
        });

        // copy resources
        this.copyResources(['styles.css', 'table-examples.js', 'highlight.css']);
    }
}
