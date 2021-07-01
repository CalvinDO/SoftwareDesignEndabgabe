import { Console } from "console";
import { start } from "repl";
import ConsoleHandling from "./ConsoleHandling";
import { VATime } from "./VATime";

export class VATimeSpan {

    public startTime: VATime;
    public endTime: VATime;
    public totalVaccinations: number;
    public registeredEmails: string[];

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
        if (this.startTime.hours == 0 && this.startTime.minutes == 0) {
            return true;
        }
        return false;
    }

    public endsAt59InNight(): boolean {
        if (this.endTime.hours == 23 && this.startTime.minutes == 59) {
            return true;
        }
        return false;
    }

    public print(): void {
        ConsoleHandling.printInput(`Vaccinating ${this.totalVaccinations} people between ${this.startTime.toString()} and ${this.endTime.toString()}`)
    }
}