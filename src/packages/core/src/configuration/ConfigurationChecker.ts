import { TestExecutionUnitConfig } from './schema/TestExecutionUnitConfig';
import { RuntimeStartUp } from './schema/RuntimeStartUp';
import { ParaType } from '../types/ParaType';
import { SelectorType } from '../types/SelectorType';
import { ObjectValidator } from '../validators/object/ObjectValidator';
import { GroupRowDefinition } from '../table/GroupRowDefinition';
import { ExecutionProxyFactoryHandler } from '../execution-proxy/ExecutionProxyFactoryHandler';
import { ExecutionType } from './schema/ExecutionType';

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
            .onlyContainsProperties(['name', 'runtime', 'context', 'groupRowDef', 'groupValidatorDef', 'rowDef'])
            // name
            .prop('name')
            .shouldString()

            // runtime
            .prop('runtime')
            .child()
            .onlyContainsProperties(['type', 'startup', 'configuration'])
            .prop('type')
            .shouldHaveValueOf(...ExecutionProxyFactoryHandler.instance.keys())
            .prop('startup')
            .shouldHaveValueOf(...Object.values(RuntimeStartUp))
            .prop('configuration')
            .shouldObjectOrFunction()

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

            // grupValidatorDef
            .prop('groupValidatorDef')
            .shouldArray('object')
            .child()
            .onlyContainsProperties(['name', 'parameter'])
            .prop('name')
            .shouldString()
            .parent()

            // rowDef
            .prop('rowDef')
            .shouldArray('object')
            .child()
            .onlyContainsProperties(
                ['action', 'executionOrder', 'executionType', 'contextProperty', 'parameterType', 'selectorType', 'validatorDef'],
                ['defaultValue']
            )
            .prop('action')
            .shouldString()
            .prop('executionOrder')
            .shouldHaveValueOf('config', 'pre')
            .prop('executionType')
            .shouldHaveValueOf(...Object.values(ExecutionType))
            .prop('parameterType')
            .shouldHaveValueOf(...Object.values(ParaType))
            .prop('selectorType')
            .shouldHaveValueOf(...Object.values(SelectorType))
            .prop('contextProperty')
            .shouldString()

            // rowDef / validatorDef
            .prop('validatorDef')
            .shouldArray('object')
            .child()
            .onlyContainsProperties(['name', 'parameter'])
            .prop('name')
            .shouldString();
    }
}
