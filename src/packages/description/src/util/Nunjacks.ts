import * as nunjucks from 'nunjucks'

import { Description } from '@boart/core'
import { marked } from 'marked'
import { DescriptionLinkReference } from '../basic/DescriptionLinkReference'
import { ChildMap } from './ChildMap'

/**
 *
 */
export class Nunjucks {
    private _env: nunjucks.Environment

    /**
     *
     */
    constructor (searchPath: string) {
        this._env = new nunjucks.Environment(new nunjucks.FileSystemLoader(searchPath), { autoescape: false })
        this.addDefaultFilter()
    }

    /**
     *
     */
    public get env (): nunjucks.Environment {
        return this._env
    }

    /**
     *
     */
    private addDefaultFilter () {
        this.addMarkdownFilter()
        this.addParentFilter()
    }

    /**
     *
     */
    private static convertMarkdownToHTML (markdownText: string): string {
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
        }
        const renderer = new marked.Renderer()
        marked.setOptions(mdOptions)
        return marked(markdownText, { renderer })
    }

    /**
     *
     */
    private addMarkdownFilter (): void {
        this._env.addFilter('brtMarkdown', (str: string) => Nunjucks.convertMarkdownToHTML(str))
    }

    /**
     *
     */
    private addParentFilter (): void {
        this._env.addFilter('brtOnlyParents', (documents: Description[]) => {
            const parents = documents.filter(d => !d.parentId)
            return parents
        })
    }

    /**
     *
     */
    public addChildsFilter (childMap: ChildMap): void {
        this._env.addFilter('brtChilds', (document: Description) => {
            return childMap.get(document.id)
        })
    }

    /**
     *
     */
    public addRefFilter (linkReferenceMap: Map<string, DescriptionLinkReference>): void {
        this._env.addFilter('brtRef', (document: Description) => {
            return linkReferenceMap.get(document.id)?.marker
        })
    }
}
