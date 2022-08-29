import { LocalReport } from './report/LocalReport';
import { StepReport } from './report/StepReport';
import { TestReport } from './report/TestReport';

export declare global {
    var _localReportInstance: LocalReport;
    var _stepReportInstance: StepReport;
    var _testReportInstance: TestReport;

    /**
     *
     */
    interface fs {
        readFileSync(filename: string, encoding: 'utf-8'): string;
    }

    /**
     *
     */
    interface path {
        resolve(path: string, filename: string): string;
    }
}
