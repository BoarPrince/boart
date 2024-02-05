import { BaseRowMetaDefinition, ObjectValidator, RowValidator, ValidatorFactory } from '@boart/core';

/**
 *
 */
export interface ValidatorDefinition {
    qualifier: string;
    paras: string[];
}

/**
 * allowed qualifiers can also be null or empty string if no parameter is possible too.
 */
export class QualifierValidator implements RowValidator {
    constructor(private readonly allowedQualifierDefinitions: readonly ValidatorDefinition[]) {}

    /**
     *
     */
    public static factory(): ValidatorFactory {
        return {
            name: 'QualifierValidator',

            /**
             * F A C T O R Y
             */
            check(para: string | Array<unknown> | object): boolean {
                ObjectValidator.instance(para)
                    .notNull()
                    .shouldArray()
                    .onlyContainsProperties(['qualifier', 'paras'])
                    .prop('qualifier')
                    .shouldString()
                    .prop('paras')
                    .shouldArray();
                return true;
            },

            /**
             *
             */
            create(para: string | Array<unknown> | object): RowValidator {
                return new QualifierValidator(para as ValidatorDefinition[]);
            }
        };
    }

    /**
     *
     */
    private addString(value: string, delim: string, additional: string): string {
        return !additional ? value : value + delim + additional;
    }

    /**
     *
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate(row: BaseRowMetaDefinition<any, any>) {
        if (!this.allowedQualifierDefinitions && !row.ast.qualifier) {
            return;
        }

        const qualifier = row.ast.qualifier?.value ?? '';
        const qualifierParas = row.ast.qualifier?.paras?.join(':');
        const qualifierDef = this.addString(qualifier, ':', qualifierParas);

        for (const definition of this.allowedQualifierDefinitions ?? []) {
            const definitionParas = !definition.paras?.length ? [''] : definition.paras;
            for (const definitionPara of definitionParas) {
                const definitionDef = this.addString(definition.qualifier, ':', definitionPara) ?? '';
                if (qualifierDef == definitionDef) {
                    return;
                }
            }
        }

        const allowedDef = (this.allowedQualifierDefinitions ?? [])
            .reduce((acc, def) => {
                acc.push(this.addString(def.qualifier, ':', def.paras?.join(':')));
                return acc;
            }, new Array<string>())
            .map((def) => (!def ? "''" : `'${def}'`));

        throw Error(
            `Qualifier '${this.addString(qualifier, ':', qualifierParas)}' of action '${
                row.ast.name.stringValue
            }' is not defined. Allowed is ${allowedDef.join(' or ') || "''"}`
        );
    }
}
