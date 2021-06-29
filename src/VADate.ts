import { exception } from "console";
import { stringifyConfiguration } from "tslint/lib/configuration";

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

    private stringToYearMonthDay(_seperator: string): void {
        let splitted: string[] = this.dateString.split(_seperator);

        this.day = +splitted[0];
        this.month = +splitted[1];
        this.year = +splitted[2];
    }

    public toString(): string {
        return this.dateString;
    }
}