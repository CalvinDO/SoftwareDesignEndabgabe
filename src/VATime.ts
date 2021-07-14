import { VAAdministrator } from "./VAAdministrator";

export class VATime {
    private hours: number;
    private minutes: number;

    private timeString: string;

    constructor(_timeString: string) {
        this.timeString = _timeString;

        let regex: RegExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!regex.test(this.timeString)) {
            throw new Error("Your time is invalid!");
        }

        this.stringToHoursMinutes(":");
    }

    public static dumbToSmartTime(_dumbTime: VATime): VATime {
        return new VATime(_dumbTime.timeString);
    }

    private stringToHoursMinutes(_seperator: string): void {
        let splitted: string[] = this.timeString.split(_seperator);

        this.hours = +splitted[0];
        this.minutes = +splitted[1];
    }

    private updateString(): void {
        let leadingHourPrefix: string = this.hours < 10 ? "0" : "";
        let leadingMinutePrefix: string = this.minutes < 10 ? "0" : "";
        this.timeString = `${leadingHourPrefix}${this.hours}:${leadingMinutePrefix}${this.minutes}`;
    }

    public getMinutesUntil(_secondTime: VATime): number {
        return (_secondTime.hours - this.hours) * 60 + _secondTime.minutes - this.minutes;
    }

    public checkIfInsideDayTimeSpans(_dataSpecification: string) {
        if (VAAdministrator.currentEditedDay.isTimeJammed(this)) {
            throw new Error(`your  ${_dataSpecification} is jammed!`);
        }
    }

    public clone(): VATime {
        return new VATime(this.timeString);
    }

    public toString(): string {
        return this.timeString;
    }


    public addMinutes(_minutes: number): void {
        this.minutes += _minutes;
        let overflowFactor: number = Math.floor(this.minutes / 60);

        this.minutes = this.minutes % 60;
        this.hours += overflowFactor;

        this.updateString();
    }

    public isZeroInMorning(): boolean {
        return (this.hours == 0 && this.minutes == 0);
    }

    public is59InNight(): boolean {
        return (this.hours == 23 && this.minutes == 59);
    }
}