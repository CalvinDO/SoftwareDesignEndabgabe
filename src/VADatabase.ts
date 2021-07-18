import { F_OK } from "constants";
import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import { VAAnswerPossibility } from "./VAAnswerPossibility";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VADate } from "./VADate";
import { VATimeRelativity } from "./VATimeRelativity";

export class VADatabase {
    public static appointmentDB: VAAppointmentDay[];

    public static init(): void {

        try {
            this.JSONToDB()
        } catch (error) {
            if (error.message == "Unexpected end of JSON input") {
                this.appointmentDB = [];
            } else {
                throw error;
            }
        }
        this.sortAllDBData();
        this.DBToJSON();
    }

    public static getDaysIn(relativity: VATimeRelativity): VAAppointmentDay[] {

        let currentDate: VADate = VADate.dateToVADate(new Date());

        let days: VAAppointmentDay[] = [];

        this.appointmentDB.forEach(day => {
            let pushCondition: boolean = day.date.isBefore(currentDate);
            pushCondition = relativity == VATimeRelativity.Past ? pushCondition : !pushCondition;

            if (pushCondition) {
                days.push(day);
            }
        });

        return days;
    }

    public static getCompactDaysPossibilities(): VAAnswerPossibility[] {

        let possibleDays: VAAnswerPossibility[] = [];

        this.appointmentDB.forEach(day => {

            let colorString: string = "";
            let currentString: string = `${day.date.toString()}`;

            if (day.OccupancyPercentage == 100) {
                colorString = "\x1b[2m";
            }

            let possibleAnswer: string = colorString.concat(currentString);
            let info: string = `(${day.OccupancyPercentage}% occupied)`;


            let possibility: VAAnswerPossibility = new VAAnswerPossibility(possibleAnswer, info, day.OccupancyPercentage >= 100);

            possibleDays.push(possibility);
        });

        return possibleDays;
    }

    public static sortAllDBData(): void {

        this.appointmentDB.sort((firstDay, secondDay) => firstDay.date.Month - secondDay.date.Month);

        let monthlyGroupedAppointmentDB: VAAppointmentDay[][] = [];
        let lastMonth: number = 0;

        this.appointmentDB.forEach(day => {
            if (day.date.Month > lastMonth) {
                monthlyGroupedAppointmentDB.push([]);
            }
            monthlyGroupedAppointmentDB[monthlyGroupedAppointmentDB.length - 1].push(day);
        });

        this.appointmentDB = [];

        monthlyGroupedAppointmentDB.forEach(daysOfMonth => {
            daysOfMonth.sort((firstDay, secondDay) => firstDay.date.Day - secondDay.date.Day);
            this.appointmentDB = this.appointmentDB.concat(daysOfMonth);
        });

        this.appointmentDB.forEach(day => {
            day.sort();
        })
    }

    public static addDay(_appointmentDay: VAAppointmentDay): void {

        if (_appointmentDay.isNewInstance) {
            this.appointmentDB.push(_appointmentDay);
        }

        this.sortAllDBData();
        this.DBToJSON();
    }

    public static getAppointmentDay(_date: VADate): VAAppointmentDay {

        for (let day of this.appointmentDB) {

            if (day.isOnSameDateLike(_date)) {
                return day;
            }
        }

        return null;
    }


    private static printDB(): void {
        ConsoleHandling.printInput(JSON.stringify(this.appointmentDB));
    }

    private static DBToJSON(): void {
        FileHandler.writeFile("appointmentDB.json", this.appointmentDB);
    }

    private static JSONToDB(): void {

        let dumbAppointmentDB: VAAppointmentDay[] = <VAAppointmentDay[]>FileHandler.readObjectFile("appointmentDB.json");
        let smartAppointmentDB: VAAppointmentDay[] = [];
        dumbAppointmentDB.forEach(dumbday => {
            smartAppointmentDB.push(VAAppointmentDay.dumbToSmartDay(dumbday));
        })

        this.appointmentDB = smartAppointmentDB;
    }
}