import { Store } from './Store';

/**
 *
 */
it('check test store', () => {
    const sut = Store.instance;

    sut.testStore.put('a', 'b');
    expect(sut.testStore.get('a').toString()).toBe('b');
});

/**
 *
 */
it('check local store', () => {
    const sut = Store.instance;

    sut.localStore.put('a', 'b');
    expect(sut.localStore.get('a').toString()).toBe('b');
});

/**
 *
 */
it('check global store', () => {
    const sut = Store.instance;

    sut.globalStore.put('a', 'b');
    expect(sut.globalStore.get('a').toString()).toBe('b');
});

/**
 *
 */
it('check step store', () => {
    const sut = Store.instance;

    sut.stepStore.put('a', 'b');
    expect(sut.stepStore.get('a').toString()).toBe('b');
});
