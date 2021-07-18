import { Console } from "console";
import { start } from "repl";
import ConsoleHandling from "./ConsoleHandling";
import { VAAdministrator } from "./VAAdministrator";
import { VATime } from "./VATime";

export class VATimeSpan {


    private startTime: VATime;
    private endTime: VATime;
    private maxVaccinations: number;
    private registeredEmails: string[] = [];

    get StartTime(): VATime { return this.startTime }
    get EndTime(): VATime { return this.endTime }
    get MaxVaccinations(): number { return this.maxVaccinations }
    get AmountRegistered(): number { return this.registeredEmails.length }
    get OccupiedVaccinations(): number { return this.AmountRegistered; }
    get FreeVaccinations(): number { return this.MaxVaccinations - this.OccupiedVaccinations; }
    get RegisteredEmails(): string[] { return this.registeredEmails }

    constructor(_startTime: VATime, _endTime: VATime, _maxVaccinations?: number, _registeredEmails?: string[]) {
        this.startTime = _startTime.clone();
        this.endTime = _endTime.clone();
        this.maxVaccinations = _maxVaccinations;

        if (_registeredEmails) {
            this.registeredEmails = _registeredEmails;
        }
    }

    public registerEmail(email: string) {
        this.registeredEmails.push(email);
    }

    public printFormated(_isLast: boolean): void {
        let freeVaccinations: number = this.maxVaccinations - this.registeredEmails.length;

        let verticalLine: string = _isLast ? "" : "│";
        let cornerCross: string = _isLast ? "└" : "├";
        ConsoleHandling.printInput(`	${cornerCross}── ${freeVaccinations} of ${this.maxVaccinations} vaccinations free: `);
        ConsoleHandling.printInput(`	${verticalLine}	├── from ${this.startTime.toString()}`);
        ConsoleHandling.printInput(`	${verticalLine}	└── to ${this.endTime.toString()}`);
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
        return new VATimeSpan(VATime.dumbToSmartTime(_dumbSpan.startTime), VATime.dumbToSmartTime(_dumbSpan.endTime), _dumbSpan.maxVaccinations, _dumbSpan.registeredEmails);
    }

    public beginsAtZeroInMorning(): boolean {
        return this.startTime.isZeroInMorning();
    }

    public endsAt59InNight(): boolean {
        return this.endTime.is59InNight();
    }

    public print(): void {
        ConsoleHandling.printInput(`Vaccinating ${this.maxVaccinations} people between ${this.startTime.toString()} and ${this.endTime.toString()}`)
    }

    public printTimesOnly(): void {
        ConsoleHandling.printInput(`Time start: ${this.startTime.toString()}`);
        ConsoleHandling.printInput(`Time end: ${this.endTime.toString()}`);
    }

    public toString(): string {
        return `${this.startTime.toString()} - ${this.endTime.toString()}`;
    }

    public borders(_nextSpan: VATimeSpan): boolean {
        return this.endTime == _nextSpan.startTime;
    }

    public overlaps(_time: (VATime | VATimeSpan), _allowStartEquality?: boolean): boolean {
        if (_time instanceof VATime) {
            let time: VATime = <VATime>_time;
            let startsBeforeTime: boolean = this.startTime.isBefore(time);
            let startsAtTime: boolean = _allowStartEquality ? false : this.startTime.equals(time);
            let endAfterTime: boolean = this.endTime.isAfter(time);

            return ((startsBeforeTime || startsAtTime) && endAfterTime);
        }

        if (_time instanceof VATimeSpan) {
            let timeSpan: VATimeSpan = <VATimeSpan>_time;
            return (timeSpan.overlaps(this.startTime, false) || timeSpan.overlaps(this.endTime, true));
        }
    }
}