import { GroupRowDefinition } from './GroupRowDefinition';
import { RowDefinition } from './RowDefinition';
import { TableRowType } from './TableRowType';

/**
 *
 */
describe('check group row definition', () => {
    /**
     *
     */
    it('read name', () => {
        const sut = GroupRowDefinition.getInstance('xxx');
        expect(sut.name).toBe('xxx');
    });

    /**
     *
     */
    it('add definition and check subscription', (done) => {
        const sut = GroupRowDefinition.getInstance('xxx');
        sut.definitions.subscribe((def) => {
            expect(def.key.description).toBe('key');
            done();
        });

        sut.addRowDefinition(
            new RowDefinition({
                key: Symbol('key'),
                type: TableRowType.Configuration,
                executionUnit: null,
                validators: null
            })
        );
    });

    /**
     *
     */
    it('add group validation and check subscription', (done) => {
        const sut = GroupRowDefinition.getInstance('xxx');
        sut.validations.subscribe((validator) => {
            expect(validator.name).toBe('validator');
            done();
        });

        sut.addGroupValidation({
            name: 'validator',
            validate: null
        });
    });
});
