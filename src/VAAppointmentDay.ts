import { Console, time } from "console";
import ConsoleHandling from "./ConsoleHandling";
import { VADatabase } from "./VADatabase";
import { VADate } from "./VADate";
import { VADayStatistic } from "./VAStatistics";
import { VATime } from "./VATime";
import { VATimeRelativity } from "./VATimeRelativity";
import { VATimeSpan } from "./VATimeSpan";

export class VAAppointmentDay {

    public date: VADate;
    private timeSpans: VATimeSpan[];

    public isNewInstance: boolean;

    get OccupancyPercentage(): number {
        return this.getOccupancyPercentage();
    }

    get TimeSpans(): VATimeSpan[] {
        return this.timeSpans;
    }

    get AmountFreeDates(): number {
        return this.getMaxVaccinationAmount() - this.getOccupancyAmount();
    }

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

    /*
        public showStatistic(relativity: VATimeRelativity): void {
            let occupied: number = this.getOccupancyAmount();
            let statistic: VADayStatistic = new VADayStatistic(this.getOccupancyAmount(), this.getMaxVaccinationAmount() - occupied);
            statistic.print(relativity);
        }
    */

    public sort() {
        this.timeSpans.sort((firstSpan, secondSpan) => firstSpan.StartTime.getMinutesSinceMidnight() - secondSpan.StartTime.getMinutesSinceMidnight());
    }

    public show(): void {
        ConsoleHandling.printInput("");
        ConsoleHandling.printInput("-------------------------------");
        ConsoleHandling.printInput(`Selected date: ${this.date.toString()}`);

        this.showTimeSpans();
        ConsoleHandling.printInput("-------------------------------");
        ConsoleHandling.printInput("");

    }

    private showTimeSpans(): void {
        ConsoleHandling.printInput(`└── ${this.getFreePercentage()}% of time spans free:`);
        this.timeSpans.forEach(span => {
            let isLast: boolean = this.timeSpans.indexOf(span) == this.timeSpans.length - 1;
            span.printFormated(isLast);
        })
    }

    private getFreePercentage(): number {
        return 100 - this.getOccupancyPercentage();
    }

    private getOccupancyAmount(): number {

        let totalOccupancys: number = 0;

        this.timeSpans.forEach(timeSpan => {
            totalOccupancys += timeSpan.AmountRegistered;
        })

        return totalOccupancys;
    }

    private getMaxVaccinationAmount(): number {
        let maxVaccinations: number = 0;

        this.timeSpans.forEach(timeSpan => {
            maxVaccinations += timeSpan.MaxVaccinations;
        })

        return maxVaccinations;
    }

    private getOccupancyPercentage(): number {

        let percentage: number = (this.getOccupancyAmount() / this.getMaxVaccinationAmount()) * 100;
        return +percentage.toFixed(0);
    }



    private proceedWithFoundDay(foundDay: VAAppointmentDay): VAAppointmentDay {
        if (foundDay.isJammed()) {
            ConsoleHandling.printInput("This day is jammed from 00:00 to 23:59");
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

        if (!this.timeSpans[0].beginsAtZeroInMorning() || !this.timeSpans[amountTimeSpans - 1].endsAt59InNight()) {
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

    public isTimeJammed(_time: VATime | VATimeSpan, _allowStartEquality?: boolean): boolean {

        for (let span of this.timeSpans) {

            if (span.overlaps(_time, _allowStartEquality)) {
                return true;
            }
        }

        return false;
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
        this.timeSpans = this.timeSpans.concat(_timeSpans);
    }

    public isOnSameDateLike(_date: VADate): boolean {
        return this.date.equals(_date);
    }
}