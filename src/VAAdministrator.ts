import ConsoleHandling from "./ConsoleHandling";
import { VAUser } from "./VAUser";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VAAppointmentSalve } from "./VAAppointmentSalve";
import { VADatabase } from "./VADatabase";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VATimeSpan } from "./VATimeSpan";

export class VAAdministrator extends VAUser {
    public static username: string = "MaxDerBoss";
    public static password: string = "ichbinboss";

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

        let day: VAAppointmentDay = <VAAppointmentDay>await this.getAppointmentDataOf("date");

        let startTime: VATime = <VATime>await this.getAppointmentDataOf("startTime");
        let endTime: VATime = <VATime>await this.getAppointmentDataOf("endTime");

        let totalVaccinations: number = <number>await this.getAppointmentDataOf("totalVaccinations");

        let timeInterval: number = <number>await this.getAppointmentDataOf("timeInterval");

        this.printVaccinationCreationState(day.date, startTime, endTime, totalVaccinations, timeInterval);

        let timeSpans: VATimeSpan[] = this.generateTimeSpans(startTime, endTime, totalVaccinations, timeInterval);
        day.addTimeSpans(timeSpans);

        day.print();
        ConsoleHandling.printInput("");

        ConsoleHandling.printInput(`Appointment Generation finished! Generated ${timeSpans.length} time spans!`);
        ConsoleHandling.printInput("Above you can see the time spans of the appointments you have generated:");

        VADatabase.addDay(day);
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

                    return new VATime(await ConsoleHandling.question(`Please type in the ${_dataSpecification} in the following format: HH:MM  `));
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
                ConsoleHandling.printInput("unknown system error:");
                throw error;
            }
        }

        return await this.getAppointmentDataOf(_dataSpecification);
    }

    private generateTimeSpans(_startTime: VATime, _endTime: VATime, _totalVaccinations: number, _timeInterval: number): VATimeSpan[] {
        let newStartTime: VATime = _startTime.clone();
        let newEndTime: VATime = _startTime.clone();
        let timeSpans: VATimeSpan[] = [];

        let index: number = 0;
        while (newStartTime.getDifferenceTo(_endTime) >= _timeInterval) {

            newEndTime.addMinutes(_timeInterval);

            let newTimeSpan: VATimeSpan = new VATimeSpan(newStartTime, newEndTime, _totalVaccinations);
            timeSpans.push(newTimeSpan);

            newStartTime = newEndTime.clone();

            index++;
        }

        return timeSpans;
    }

    private printVaccinationCreationState(_date: VADate, _startTime: VATime, _endTime: VATime, _totalVaccinations: number, _timeInterval: number) {
        ConsoleHandling.printInput("");
        ConsoleHandling.printInput(`Date: ${_date.dateString}`);
        ConsoleHandling.printInput(`Time start: ${_startTime.timeString}`);
        ConsoleHandling.printInput(`Time end: ${_endTime.timeString}`);
        ConsoleHandling.printInput(`Vaccinating ${_totalVaccinations} people all ${_timeInterval} minutes!`);
        ConsoleHandling.printInput("");
    }

    private viewStatistics(): void {

    }
}
