import { Console, time } from "console";
import ConsoleHandling from "./ConsoleHandling";
import { VADatabase } from "./VADatabase";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VATimeSpan } from "./VATimeSpan";

export class VAAppointmentDay {


    public date: VADate;
    private timeSpans: VATimeSpan[];



    constructor(_date: VADate) {
        this.date = _date.clone();
        this.timeSpans = [];

        if (VADatabase.appointmentDB && VADatabase.appointmentDB.length > 0) {
            let foundDay: VAAppointmentDay = VADatabase.getAppointmentDay(_date);
            console.log(foundDay);
            
            if (foundDay) {
                console.log("lololo");
                ConsoleHandling.printInput("This day already has appointments. We will add your new appointments to this day!");

                if (foundDay.isJammed()) {
                    ConsoleHandling.printInput("This day is jammed from 00:00 to 24:00");
                    throw new Error("DayJammedError");
                }

                return foundDay;
            }
        }
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

            if (timeSpan.endTime != nextTimeSpan.startTime) {
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
        this.timeSpans.concat(_timeSpans);
    }
}