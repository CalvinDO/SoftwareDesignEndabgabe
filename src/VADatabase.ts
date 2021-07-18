import { F_OK } from "constants";
import { times } from "lodash";
import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import { VARegistrationData as VARegistrationData } from "./RegistrationData";
import { VAAnswerPossibility } from "./VAAnswerPossibility";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VATimeRelativity } from "./VATimeRelativity";
import { VATimeSpan } from "./VATimeSpan";

export class VADatabase {



    public static appointmentDB: VAAppointmentDay[];
    public static registrationDB: VARegistrationData[];
    public static waitingListDB: VARegistrationData[];

    public static emailRegex: RegExp =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    public static nameRegex: RegExp = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

    public static phoneRegex: RegExp = /(\(? ([\d \-\) \–\+\/\(]+)\)?([ .\-–\/]?)([\d]+))/;


    public static init(): void {
        this.JSONToDB();

        this.sortAllDayDBData();
        this.AppointmentDBToJSON();
    }


    public static isPhoneNumber(_phoneNumber: string): boolean {
        return this.phoneRegex.test(_phoneNumber);
    }

    public static areNoFreeDatesAvailable(): boolean {
        let totalFreeDates: number = 0;

        this.appointmentDB.forEach(day => {
            day.TimeSpans.forEach(timeSpan => {
                totalFreeDates += timeSpan.FreeVaccinations;
            })
        })

        return totalFreeDates <= 0;
    }

    public static addRegistrationData(_regData: VARegistrationData): void {
        this.registrationDB.push(_regData);

        this.sendConfirmationEmail(_regData);

        this.RegistrationDBToJSON();
        this.AppointmentDBToJSON();
    }

    public static addWaitingRegistrationData(_regData: VARegistrationData): void {
        this.waitingListDB.push(_regData);

        this.WaitingDBToJSON();
    }

    public static getWaitingRegistrationData(_date: VADate, _startTime: VATime): Promise<VARegistrationData> {
        for (let regData of this.registrationDB) {
            let smartTime: VATime = VATime.dumbToSmartTime(regData.startTime);
            if (smartTime.equals(_startTime) && _date.equals(VADate.dumbToSmartDate(regData.date))) {
                return regData;
            }
        }
    }


    private static sendConfirmationEmail(_regData: VARegistrationData) {
        console.warn("A confirmation was send to your email adress!");
        ConsoleHandling.printInput("You registrated with following data:");
        console.log(_regData);
    }

    public static isEmailAlreadyUsed(_email: string): boolean {
        return this.appointmentDB.find(
            day =>
                day.TimeSpans.find(
                    timeSpan =>
                        timeSpan.RegisteredEmails.find(
                            email =>
                                email == _email
                        )
                )
        ) != undefined;
    }

    public static getAllTimeSpansOf(_days: VAAppointmentDay[]): VATimeSpan[] {
        let timeSpans: VATimeSpan[] = [];

        _days.forEach(day => {
            timeSpans = timeSpans.concat(day.TimeSpans);
        });

        return timeSpans;
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

    public static getDateCompareNumber(_firstDay: VAAppointmentDay, _secondDay: VAAppointmentDay): number {
        if (_firstDay.date.isBefore(_secondDay.date)) {
            return -1;
        }

        if (_secondDay.date.isBefore(_firstDay.date)) {
            return 1;
        }
        return 0;
    }

    public static sortAllDayDBData(): void {
        this.appointmentDB = this.appointmentDB.sort((firstDay, secondDay) => this.getDateCompareNumber(firstDay, secondDay));
    }

    public static addDay(_appointmentDay: VAAppointmentDay): void {

        if (_appointmentDay.isNewInstance) {
            this.appointmentDB.push(_appointmentDay);
        }

        this.sortAllDayDBData();
        this.AppointmentDBToJSON();
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

    private static AppointmentDBToJSON(): void {
        FileHandler.writeFile("appointmentDB.json", this.appointmentDB);

    }
    private static RegistrationDBToJSON(): void {
        FileHandler.writeFile("registrationDB.json", this.registrationDB);
    }

    private static WaitingDBToJSON(): void {
        FileHandler.writeFile("waitingDB.json", this.waitingListDB);
    }

    private static JSONToDB(): void {

        let dumbAppointmentDB: VAAppointmentDay[] = <VAAppointmentDay[]>FileHandler.readObjectFile("appointmentDB.json");
        let smartAppointmentDB: VAAppointmentDay[] = [];
        dumbAppointmentDB.forEach(dumbday => {
            smartAppointmentDB.push(VAAppointmentDay.dumbToSmartDay(dumbday));
        })

        this.appointmentDB = smartAppointmentDB;

        this.registrationDB = <VARegistrationData[]>FileHandler.readObjectFile("registrationDB.json");
        this.waitingListDB = <VARegistrationData[]>FileHandler.readObjectFile("waitingDB.json");
    }
}