import { LocalItem } from './LocalItem';
import { OverviewItem } from './OverviewItem';
import { StatisticItem } from './StatisticItem';
import { TestItem } from './TestItem';

/**
 *
 */
export interface ProtocolItem {
    statistic: StatisticItem;
    overview: Array<OverviewItem>;
    locals: Record<string, LocalItem>;
    tests: Record<string, TestItem>;
    projectName: string;
    environment: string;
    durationMin: string;
    startTime: string;
}
