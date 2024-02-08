import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { RuntimeStartUp } from './schema/RuntimeStartUp';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { ObjectValidator } from '../validators/object/ObjectValidator';
import { GroupRowDefinition } from '../table/GroupRowDefinition';
import { RemoteFactoryHandler } from '../remote/RemoteFactoryHandler';

/**
 *
 */
export class ConfigurationChecker {
    /**
     *
     */
    public static checkJSONConfig(config: TestExecutionUnitConfig) {
        ObjectValidator.instance(config)
            .notNull()
            .onlyContainsProperties(['name', 'runtime', 'context', 'groupRowDef', 'rowDef'])
            // name
            .prop('name')
            .shouldString()

            // runtime
            .prop('runtime')
            .child()
            .onlyContainsProperties(['type', 'startup', 'configuration'])
            .prop('type')
            .shouldHaveValueOf(...RemoteFactoryHandler.instance.keys())
            .prop('startup')
            .shouldHaveValueOf(...Object.values(RuntimeStartUp))
            .prop('configuration')
            .shouldObject()

            // context
            .parent()
            .parent()
            .prop('context')
            .child()
            .onlyContainsProperties(['config', 'pre', 'execution'])
            .prop('config')
            .shouldObject()
            .prop('pre')
            .shouldObject()
            .prop('execution')
            .child()
            .onlyContainsProperties(['data', 'transformed', 'header'])
            .prop('data')
            .shouldObject()
            .prop('transformed')
            .shouldObject()
            .prop('header')
            .shouldObject()

            // groupRowDef
            .parent()
            .parent()
            .parent()
            .prop('groupRowDef')
            .shouldArray('string')
            .shouldHaveValueOf(...GroupRowDefinition.keys())
            .prop('rowDef')
            .shouldArray('object')

            // rowDef
            .child()
            .onlyContainsProperties(
                ['action', 'contextType', 'contextProperty', 'parameterType', 'selectorType', 'validatorDef'],
                ['defaultValue']
            )
            .prop('action')
            .shouldString()
            .prop('contextType')
            .shouldHaveValueOf('config', 'pre')
            .prop('parameterType')
            .shouldHaveValueOf(...Object.values(ParaType))
            .prop('selectorType')
            .shouldHaveValueOf(...Object.values(SelectorType))
            .prop('contextProperty')
            .shouldString()
            .prop('validatorDef')
            .shouldArray('object')

            // rowDef / validatorDef
            .child()
            .onlyContainsProperties(['name', 'parameter'])
            .prop('name')
            .shouldString()
            .prop('parameter');
    }
}
