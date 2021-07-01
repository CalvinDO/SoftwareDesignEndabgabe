import { exception } from "console";
import { stringifyConfiguration } from "tslint/lib/configuration";
import { VAAppointmentSalve } from "./VAAppointmentSalve";

export class VADate {

    public year: number;
    public month: number;
    public day: number;

    public dateString: string;

    constructor(_dateString: string) {
        this.dateString = _dateString;


        let regex: RegExp = /(\b(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})\b)|(\b(0?[1-9]|1[0-2])[^\w\d\r\n:](0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](\d{4}|\d{2})\b)/;

        if (!regex.test(this.dateString)) {
            throw new Error("Your date is invalid!");
        }

        [".", "-", "/"].forEach(seperator => {
            if (this.dateString.includes(seperator)) {
                this.stringToYearMonthDay(seperator);
            }
        })
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


    private getAppointments(): VAAppointmentSalve[] {
        return;
    }
}
