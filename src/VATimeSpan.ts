import { Console } from "console";
import { start } from "repl";
import ConsoleHandling from "./ConsoleHandling";
import { VAAdministrator } from "./VAAdministrator";
import { VATime } from "./VATime";

export class VATimeSpan {

    private startTime: VATime;
    private endTime: VATime;
    private totalVaccinations: number;
    private registeredEmails: string[];

    get StartTime(): VATime { return this.startTime };
    get EndTime(): VATime { return this.endTime };

    constructor(_startTime: VATime, _endTime: VATime, _totalVaccinations?: number) {
        this.startTime = _startTime.clone();
        this.endTime = _endTime.clone();
        this.totalVaccinations = _totalVaccinations;
    }

    public checkIfOverlapDayTimeSpans(): void {
        if (VAAdministrator.currentEditedDay.isTimeJammed(this)) {
            throw new Error(`Your requested time span overlaps with already jammed time spans on your selected day: ${VAAdministrator.currentEditedDay.date}`);
        }
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

    public printTimesOnly(): void {
        ConsoleHandling.printInput(`Time start: ${this.startTime.toString()}`);
        ConsoleHandling.printInput(`Time end: ${this.endTime.toString()}`);
    }

    public borders(_nextSpan: VATimeSpan): boolean {
        return this.endTime == _nextSpan.startTime;
    }

    public overlaps(_time: (VATime | VATimeSpan)): boolean {
        console.log("timeee: " + _time);

        if (_time instanceof VATime) {
            console.log("type is VATime");
            let time: VATime = <VATime>_time;
            return (this.startTime.getMinutesUntil(time) > 0 && this.endTime.getMinutesUntil(time) < 0);
        }

        if (_time instanceof VATimeSpan) {
            console.log("type is VATimeSpan");
            let timeSpan: VATimeSpan = <VATimeSpan>_time;
            return (timeSpan.overlaps(this.startTime) || timeSpan.overlaps(this.endTime));
        }
    }
}