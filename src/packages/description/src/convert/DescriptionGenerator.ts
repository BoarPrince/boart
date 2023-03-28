import * as fs from 'fs';
import * as path from 'path';

import { EnvLoader, FullDescription } from '@boart/core';
import { marked } from 'marked';
import * as nunjucks from 'nunjucks';

import { DescriptionCreatorFactory } from './DescriptionCreatorFactory';
import { DescriptionLinkReference } from './DescriptionLinkReference';
import { ExpectedConverter } from './ExpectedConverter';

/**
 *
 */
export class DescriptionGenerator {
    private description: FullDescription;
    private converters = new Array<DescriptionCreatorFactory>();
    private env: nunjucks.Environment;

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
        this.env = new nunjucks.Environment(new nunjucks.FileSystemLoader(searchPath), { autoescape: false });
        this.env.addFilter('markdown', (str: string) => DescriptionGenerator.convertMarkdownToHTML(str));
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
     *
     */
    private static convertMarkdownToHTML(markdownText: string): string {
        const mdOptions = {
            // whether to conform to original MD implementation
            pedantic: false,
            // Github Flavoured Markdown
            gfm: true,
            // tables extension
            tables: true,
            // smarter list behavior
            smartLists: true,
            // "smart" typographic punctuation for things like quotes and dashes
            smartypants: true,
            // sanitize HTML tags
            sanitize: true
            // ... other options
        };
        const renderer = new marked.Renderer();
        marked.setOptions(mdOptions);
        return marked(markdownText, { renderer });
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
            converter: factory.create(this.env, this.description),
            templateName: factory.resourceName + '.njk',
            fileName: EnvLoader.instance.mapDescriptionData(factory.resourceName + '.html')
        }));
        const linkReferenceMap = new Map<string, DescriptionLinkReference>();

        // create link reference list for all descriptions
        converters.forEach((converter) => converter.converter.addLinkReference(converter.fileName, linkReferenceMap));

        // use template engine to create documentations
        converters.forEach((converter) => {
            const content = converter.converter.create(converter.templateName);
            const contentWithMappedRefs = DescriptionGenerator.mapReference(content, linkReferenceMap);
            fs.writeFileSync(converter.fileName, contentWithMappedRefs, 'utf-8');
        });

        // copy resources
        this.copyResources(['styles.css', 'table-examples.js']);
    }
}
