import ConsoleHandling from "./ConsoleHandling";
import { VAUser } from "./VAUser";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VADatabase } from "./VADatabase";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VATimeSpan } from "./VATimeSpan";
import { VATimeSpecification } from "./VATimeSpecification";

export class VAAdministrator extends VAUser {
    public static username: string = "MaxDerBoss";
    public static password: string = "ichbinboss";

    public currentEditedDay: VAAppointmentDay;

    constructor() {
        super();
        this.startMenu();
    }

    private async startMenu(): Promise<void> {
        try {
            switch ((await ConsoleHandling.showPossibilities(["Create Appointments (C)", "Select a day to display detail (D)", "View Statistics (S)"], `Hello ${VAAdministrator.username} ! :) What do you want to do?`)).toUpperCase()) {
                case "C":

                    await this.createAppointments();

                    break;
                case "D":

                    await this.selectDayToDisplay();

                    break;
                case "S":
                    this.viewStatistics();
                    break;
                default:
                    ConsoleHandling.printInput("Invalid input! Please try again!");
                    break;
            }
        } catch (error) {
            if (error.message == "exit") {
                ConsoleHandling.printInput("");
                ConsoleHandling.printInput("You chose to exit!");
                ConsoleHandling.printInput("");

            } else {
                throw error;
            }
        }

        ConsoleHandling.printInput("Returning to the administrator start menu.");
        await this.startMenu();
    }

    private async createAppointments(): Promise<void> {
        ConsoleHandling.printInput("You are trying to create new Appointments. Please follow the instructions below! Type in 'exit' to exit at any time!");

        this.currentEditedDay = <VAAppointmentDay>await this.getAppointmentDataOf("date");

        let timeSpan: VATimeSpan = await this.getTimeSpan();

        let totalVaccinations: number = <number>await this.getAppointmentDataOf("totalVaccinations");

        let timeInterval: number = <number>await this.getAppointmentDataOf("timeInterval");

        this.printVaccinationCreationState(this.currentEditedDay.date, timeSpan, totalVaccinations, timeInterval);

        let timeSpans: VATimeSpan[] = this.generateTimeSpans(timeSpan, totalVaccinations, timeInterval);
        this.currentEditedDay.addTimeSpans(timeSpans);

        this.currentEditedDay.print();
        ConsoleHandling.printInput("");

        ConsoleHandling.printInput(`Appointment Generation finished! Generated ${timeSpans.length} time spans!`);
        ConsoleHandling.printInput("Above you can see the time spans of the appointments you have generated");


        VADatabase.addDay(this.currentEditedDay);
    }

    private async getTimeSpan(): Promise<VATimeSpan> {
        //span anlegen, im Konstruktor von VATimeSpan implementieren, dass ein Error geworfen wird, wenn die timespan mit dem globalem Day overlapt
        let timeSpan: VATimeSpan = await new VATimeSpan(<VATime>await this.getAppointmentDataOf("startTime"), <VATime>await this.getAppointmentDataOf("endTime"));
        return timeSpan;

    }

    private async selectDayToDisplay(): Promise<void> {
        ConsoleHandling.printInput("You chose to select a day");
        ConsoleHandling.printInput("Which day would you like to select?");

        let date: VAAppointmentDay = <VAAppointmentDay>await this.getAppointmentDataOf("date");

    }

    private async getAppointmentDataOf(_dataSpecification: string): Promise<VAAppointmentDay | VATime | number> {
        try {
            switch (_dataSpecification) {
                case "date":

                    let date: VADate = new VADate(await ConsoleHandling.question("Please type in the date in the following format: DD(.-/)MM(.-/)YYYY  "));

                    return new VAAppointmentDay(date);

                case "startTime":
                case "endTime":

                    let time: VATime = new VATime(await ConsoleHandling.question(`Please type in the ${_dataSpecification} in the following format: HH:MM  `));

                    if (this.currentEditedDay.isTimeJammed(time)) {
                        throw new Error(`your  ${_dataSpecification} is jammed!`);
                    }

                    return time;
                case "totalVaccinations":

                    let totalVaccinations: string = await ConsoleHandling.question(`Please type in the total amount of simultaneous vaccinations being possible in your clinic! `);

                    if (+totalVaccinations !== parseInt(totalVaccinations)) {

                        throw new Error("Your input is not a valid amount!");
                    }

                    return +totalVaccinations;
                case "timeInterval":

                    let timeInterval: string = await ConsoleHandling.question(`Please type in the time interval in minutes between the parallel vaccinations! `);

                    if (+timeInterval !== parseInt(timeInterval)) {

                        throw new Error("Your input is not a valid interval in minutes!");
                    }
                    return +timeInterval;
                default:

                    break;
            }
        } catch (error: any) {
            if (error.message == "exit") {
                throw new Error("exit");
            } else {
                ConsoleHandling.printInput("unknown system error: " + error.message);
            }
        }

        return await this.getAppointmentDataOf(_dataSpecification);
    }

    private generateTimeSpans(_totalTimeSpan: VATimeSpan, _totalVaccinations: number, _timeInterval: number): VATimeSpan[] {
        let newStartTime: VATime = _totalTimeSpan.StartTime.clone();
        let newEndTime: VATime = newStartTime.clone();
        let timeSpans: VATimeSpan[] = [];

        let index: number = 0;
        while (newStartTime.getMinutesUntil(_totalTimeSpan.EndTime) >= _timeInterval) {

            newEndTime.addMinutes(_timeInterval);

            let newTimeSpan: VATimeSpan = new VATimeSpan(newStartTime, newEndTime, _totalVaccinations);
            timeSpans.push(newTimeSpan);

            newStartTime = newEndTime.clone();

            newTimeSpan.print();
            index++;
        }

        return timeSpans;
    }

    private printVaccinationCreationState(_date: VADate, _timeSpan: VATimeSpan, _totalVaccinations: number, _timeInterval: number) {
        ConsoleHandling.printInput("");
        ConsoleHandling.printInput(`Date: ${_date.toString()}`);
        _timeSpan.printTimesOnly();
        ConsoleHandling.printInput(`Vaccinating ${_totalVaccinations} people all ${_timeInterval} minutes!`);
        ConsoleHandling.printInput("");
    }

    private viewStatistics(): void {

    }
}
