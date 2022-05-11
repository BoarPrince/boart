import { MarkdownTableReader } from '@boart/core';
import RestCallTableHandler from './RestCallTableHandler';

const sut = new RestCallTableHandler();

/**
 *
 */
beforeEach(() => {
    console.log('hallo');
});

/**
 *
 */
xit('xxxx', async () => {
    const tableRows = MarkdownTableReader.convert(
        `|action       |value       |
         |             |            |
         |a            |            |
         |b            |            |`
    );

    await sut.handler.process(tableRows);
});
