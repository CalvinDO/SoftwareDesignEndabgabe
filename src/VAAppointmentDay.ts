import { Console, time } from "console";
import ConsoleHandling from "./ConsoleHandling";
import { VADatabase } from "./VADatabase";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VATimeSpan } from "./VATimeSpan";

export class VAAppointmentDay {

    public date: VADate;
    private timeSpans: VATimeSpan[];

    public isNewInstance: boolean;

    constructor(_date: VADate) {
        this.date = _date.clone();
        this.timeSpans = [];
        this.isNewInstance = true;

        if (VADatabase.appointmentDB && VADatabase.appointmentDB.length > 0) {
            let foundDay: VAAppointmentDay = VADatabase.getAppointmentDay(_date);

            if (foundDay) {
                ConsoleHandling.printInput("This day already has appointments. We will add your new appointments to this day!");

                return this.proceedWithFoundDay(foundDay);
            }
        }
    }


    private proceedWithFoundDay(foundDay: VAAppointmentDay): VAAppointmentDay {
        if (foundDay.isJammed()) {
            ConsoleHandling.printInput("This day is jammed from 00:00 to 24:00");
            throw new Error("DayJammedError");
        }
        foundDay.isNewInstance = false;
        return foundDay;
    }

    public static dumbToSmartDay(_dumbDay: VAAppointmentDay): VAAppointmentDay {
        let smartDay: VAAppointmentDay = new VAAppointmentDay(VADate.dumbToSmartDate(_dumbDay.date));
        smartDay.timeSpans = VATimeSpan.dumbToSmartSpans(_dumbDay.timeSpans);
        return smartDay;
    }


    public isJammed(): boolean {

        let amountTimeSpans: number = this.timeSpans.length;

        if (!this.timeSpans[0].beginsAtZeroInMorning() || !this.timeSpans[amountTimeSpans].endsAt59InNight()) {
            return false;
        }

        this.timeSpans.forEach(timeSpan => {
            let currentIndex: number = this.timeSpans.indexOf(timeSpan);
            let nextTimeSpan: VATimeSpan = this.timeSpans[currentIndex + 1];

            if (!nextTimeSpan) {
                return true;
            }

            if (!timeSpan.borders(nextTimeSpan)) {
                return false;
            }
        })

    }

    public print(): void {
        ConsoleHandling.printInput(`Date: ${this.date.toString()}`);

        this.timeSpans.forEach(timeSpan => {
            timeSpan.print();
            ConsoleHandling.printInput("");
        });

        ConsoleHandling.printInput("");
    }

    public addTimeSpans(_timeSpans: VATimeSpan[]): void {
        if (this.timeSpans.length <= 0) {
            this.timeSpans = _timeSpans;
            return;
        }
        this.timeSpans = this.timeSpans.concat(_timeSpans);
    }

    public isOnSameDateLike(_date: VADate): boolean {
        return this.date.equals(_date);
    }
}