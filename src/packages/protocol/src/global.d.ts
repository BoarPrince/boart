import { LocalReport } from './report/LocalReport';
import { StepReport } from './report/StepReport';
import { TestReport } from './report/TestReport';

export declare global {
    var _localReportInstance: LocalReport;
    var _stepReportInstance: StepReport;
    var _testReportInstance: TestReport;
}
