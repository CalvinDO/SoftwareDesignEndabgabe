import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import { VAUser } from "./VAUser";
import { VADate } from "./VADate";
import { exception } from "console";
import { VATime } from "./VATime";
import { Type } from "typescript";
import { VAAppointmentSalve } from "./VAAppointmentSalve";

export class VAAdministrator extends VAUser {
    public static username: string = "MaxDerBoss";
    public static password: string = "ichbinboss";

    public appointmentDB: VAAppointmentSalve[] = [];

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
                ConsoleHandling.printInput(`Unkown system error: ${error.message}`);
            }
        }

        ConsoleHandling.printInput("Returning to the administrator start menu.");
        await this.startMenu();
    }

    private async createAppointments(): Promise<void> {
        ConsoleHandling.printInput("You are trying to create new Appointments. Please follow the instructions below! Type in 'exit' to exit at any time!");

        let date: VADate = <VADate>await this.getAppointmentDataOf("date");

        let startTime: VATime = <VATime>await this.getAppointmentDataOf("startTime");
        let endTime: VATime = <VATime>await this.getAppointmentDataOf("endTime");

        let totalVaccinations: number = <number>await this.getAppointmentDataOf("totalVaccinations");

        let timeInterval: number = <number>await this.getAppointmentDataOf("timeInterval");

        this.printVaccinationCreationState(date, startTime, endTime, totalVaccinations, timeInterval);

        let salves: VAAppointmentSalve[] = this.generateAppointmentSalves(date, startTime, endTime, totalVaccinations, timeInterval);
        this.addSalvesToJSON(salves);
    }

    private addSalvesToJSON(_salves: VAAppointmentSalve[]): void {
        //console.log(JSON.stringify(_salves));

        try {
            this.readUpdateAppointmentDB();
            _salves.forEach(x => this.appointmentDB.push(x));

        } catch (error) {
            this.appointmentDB = _salves;
        }

        FileHandler.writeFile("appointmentDB.json", this.appointmentDB);

        //FileHandler.writeFile("appointmentDB.json", _salves);
    }

    private readUpdateAppointmentDB(): void {
        this.appointmentDB = <VAAppointmentSalve[]>FileHandler.readObjectFile("appointmentDB.json");

    }

    private async selectDayToDisplay(): Promise<void> {
        ConsoleHandling.printInput("You chose to select a day");
        ConsoleHandling.printInput("Which day would you like to select?");
        let date: VADate = <VADate>await this.getAppointmentDataOf("date");
        let appointmentsOfDay: VAAppointmentSalve[] = date.getAppointments();
    }

    private async getAppointmentDataOf(_dataSpecification: string): Promise<VADate | VATime | number> {
        try {
            switch (_dataSpecification) {
                case "date":

                    return new VADate(await ConsoleHandling.question("Please type in the date in the following format: DD(.-/)MM(.-/)YYYY  "));
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
            }
            ConsoleHandling.printInput(error.message);
            ConsoleHandling.printInput("please try again!");
        }

        return await this.getAppointmentDataOf(_dataSpecification);
    }

    private generateAppointmentSalves(_date: VADate, _startTime: VATime, _endTime: VATime, _totalVaccinations: number, _timeInterval: number): VAAppointmentSalve[] {
        let timeSpan: number = _startTime.getDifferenceTo(_endTime);
        ConsoleHandling.printInput(timeSpan.toString());

        let newStartTime: VATime = _startTime.clone();
        let newEndTime: VATime = _startTime.clone();
        let salves: VAAppointmentSalve[] = [];

        let index: number = 0;
        while (newStartTime.getDifferenceTo(_endTime) > _timeInterval && index < 20) {

            newEndTime.addMinutes(_timeInterval);

            let newSalve: VAAppointmentSalve = new VAAppointmentSalve(_date, newStartTime, newEndTime, _totalVaccinations);
            salves.push(newSalve);

            newStartTime = newEndTime.clone();

            newSalve.print();

            index++;
        }

        ConsoleHandling.printInput("Appointment Generation finished!");

        return salves;
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
