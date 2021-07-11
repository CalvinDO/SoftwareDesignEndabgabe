import { Console } from "console";
import { start } from "repl";
import ConsoleHandling from "./ConsoleHandling";
import { VATime } from "./VATime";

export class VATimeSpan {

    private startTime: VATime;
    private endTime: VATime;
    private totalVaccinations: number;
    private registeredEmails: string[];

    constructor(_startTime: VATime, _endTime: VATime, _totalVaccinations: number) {
        this.startTime = _startTime.clone();
        this.endTime = _endTime.clone();
        this.totalVaccinations = _totalVaccinations;
    }

    public static dumbToSmartSpans(_dumbSpans: VATimeSpan[]): VATimeSpan[] {
        let smartSpans: VATimeSpan[] = [];
        _dumbSpans.forEach(dumbSpan => {
            smartSpans.push(this.dumbToSmartSpan(dumbSpan));
        })

        return smartSpans;
    }

    public static dumbToSmartSpan(_dumbSpan: VATimeSpan): VATimeSpan {
        return new VATimeSpan(VATime.dumbToSmartTime(_dumbSpan.startTime), VATime.dumbToSmartTime(_dumbSpan.endTime), _dumbSpan.totalVaccinations);
    }


    public beginsAtZeroInMorning(): boolean {
        return this.startTime.isZeroInMorning();
    }

    public endsAt59InNight(): boolean {
        return this.endTime.is59InNight();
    }

    public print(): void {
        ConsoleHandling.printInput(`Vaccinating ${this.totalVaccinations} people between ${this.startTime.toString()} and ${this.endTime.toString()}`)
    }

    public borders(_nextSpan: VATimeSpan): boolean {
        return this.endTime == _nextSpan.startTime;
    }
}