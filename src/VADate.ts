import { exception } from "console";
import { stringifyConfiguration } from "tslint/lib/configuration";

export class VADate {

    private year: number;
    private month: number;
    private day: number;

    private dateString: string;

    get Month(): number {
        return this.month;
    }

    get Day(): number {
        return this.day;
    }

    constructor(_dateString?: string) {
        if (!_dateString) {
            return;
        }
        this.dateString = _dateString;


        let dateRegex: RegExp = /(\b(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})\b)|(\b(0?[1-9]|1[0-2])[^\w\d\r\n:](0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](\d{4}|\d{2})\b)/;

        if (!dateRegex.test(this.dateString)) {
            throw new Error("Your date is invalid!");
        }

        [".", "-", "/"].forEach(seperator => {
            if (this.dateString.includes(seperator)) {
                this.stringToYearMonthDay(seperator);
            }
        })
    }

    public static dateToVADate(_date: Date): VADate {
        return new VADate(`${_date.getDate()}.${_date.getMonth() + 1}.${_date.getFullYear()}`);
    }

    public static dumbToSmartDate(_dumbDate: VADate): VADate {
        return new VADate(_dumbDate.dateString);
    }

    public clone(): VADate {
        return new VADate(this.dateString);
    }

    public equals(_date: VADate): boolean {
        return JSON.stringify(this) == JSON.stringify(_date);
    }

    private stringToYearMonthDay(_seperator: string): void {
        let splitted: string[] = this.dateString.split(_seperator);

        this.day = +splitted[0];
        this.month = +splitted[1];
        this.year = +splitted[2];
    }

    public toString(): string {
        return this.dateString;
    }

    public isBefore(_otherDate: VADate): boolean {
        let dayDiff: number = this.getDayDiff(_otherDate.day);
        let monthDiff: number = this.getMonthDiff(_otherDate.day);
        let yearDiff: number = this.getYearDiff(_otherDate.year);


        if (yearDiff < 0) {
            return false;
        }

        if (yearDiff > 0) {
            return true;
        }

        if (monthDiff < 0) {
            return false;
        }

        if (monthDiff > 0) {
            return true;
        }

        if (dayDiff > 0) {
            return true;
        }

        return false;
    }


    public getDayDiff(_otherDay: number): number {
        return _otherDay - this.day;
    }

    public getMonthDiff(_otherMonth: number): number {
        return _otherMonth - this.month
    }

    public getYearDiff(_otherYear: number): number {
        return _otherYear - this.year;
    }
}
