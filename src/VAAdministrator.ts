import ConsoleHandling from "./ConsoleHandling";
import { VAUser } from "./VAUser";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VADatabase } from "./VADatabase";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VATimeSpan } from "./VATimeSpan";
import { VATimeSpecification } from "./VATimeSpecification";
import { userInfo } from "os";
import { VAUserManager } from "./VAUserManager";
import { VATimeRelativity } from "./VATimeRelativity";
import { Console } from "console";
import { VADayStatistic as VAStatistics } from "./VAStatistics";
import { times } from "lodash";

export class VAAdministrator extends VAUser {
    public static username: string = "admin";
    public static password: string = "admin";

    public static currentEditedDay: VAAppointmentDay;

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
                    this.showStatistics();
                    break;
                default:
                    ConsoleHandling.printInput("Invalid input! Please try again!");
                    break;
            }
        } catch (error) {
            if (error.message == "exit") {
                ConsoleHandling.printInput("")
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

        VAAdministrator.currentEditedDay = <VAAppointmentDay>await this.getAppointmentDataOf("date");

        let timeSpan: VATimeSpan = <VATimeSpan>await this.getAppointmentDataOf("timeSpan");

        let totalVaccinations: number = <number>await this.getAppointmentDataOf("totalVaccinations");

        let timeInterval: number = <number>await this.getAppointmentDataOf("timeInterval");

        this.printVaccinationCreationState(VAAdministrator.currentEditedDay.date, timeSpan, totalVaccinations, timeInterval);

        let timeSpans: VATimeSpan[] = this.generateTimeSpans(timeSpan, totalVaccinations, timeInterval);
        VAAdministrator.currentEditedDay.addTimeSpans(timeSpans);

        VAAdministrator.currentEditedDay.print();
        ConsoleHandling.printInput("");

        ConsoleHandling.printInput(`Appointment Generation finished! Generated ${timeSpans.length} time spans!`);
        ConsoleHandling.printInput("Above you can see the time spans of the appointments you have generated");

        VAAdministrator.currentEditedDay.assignEmailFromWaitingList();

        VADatabase.addDay(VAAdministrator.currentEditedDay);
    }

    private async selectDayToDisplay(): Promise<void> {
        ConsoleHandling.printInput("You chose to select a day.");
        ConsoleHandling.printInput("Which day would you like to select?");

        let answer: string = await ConsoleHandling.getChosenPossibilityAnswer(VADatabase.getCompactDaysPossibilities(), "Please type in the date you want to select!");
        let date: VADate = new VADate(answer);
        let day: VAAppointmentDay = VADatabase.getAppointmentDay(date);

        day.show();
    }

    private async getAppointmentDataOf(_dataSpecification: string): Promise<VAAppointmentDay | VATime | VATimeSpan | number> {
        try {
            switch (_dataSpecification) {

                case "date":

                    let date: VADate = new VADate(await ConsoleHandling.question("Please type in the date in the following format: DD(.-/)MM(.-/)YYYY  "));

                    return new VAAppointmentDay(date);

                case "startTime":
                case "endTime":

                    let time: VATime = new VATime(await ConsoleHandling.question(`Please type in the ${_dataSpecification} in the following format: HH:MM  `));
                    time.checkIfInsideDayTimeSpans(_dataSpecification, _dataSpecification == "endTime");

                    return time;
                case "timeSpan":
                    let timeSpan: VATimeSpan = new VATimeSpan(<VATime>await this.getAppointmentDataOf("startTime"), <VATime>await this.getAppointmentDataOf("endTime"));
                    timeSpan.checkIfOverlapDayTimeSpans();
                    return timeSpan;
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
                ConsoleHandling.printInput(error.message);
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

    private showStatistics(): void {
        ConsoleHandling.printInput("You chose to view the statistics of all days.");

        ConsoleHandling.printInput("");
        ConsoleHandling.printInput("----------------------------");
        this.showStatisticsOf(VATimeRelativity.Past);
        this.showStatisticsOf(VATimeRelativity.Future);
        ConsoleHandling.printInput("----------------------------");
        ConsoleHandling.printInput("");

    }

    private showStatisticsOf(_relativity: VATimeRelativity) {
        let days: VAAppointmentDay[] = VADatabase.getDaysIn(_relativity);

        let totalTimeSpans: VATimeSpan[] = VADatabase.getAllTimeSpansOf(days);


        ConsoleHandling.printInput(` ${VATimeRelativity[_relativity]} Appointments: ${totalTimeSpans.length}`);

        let free: number = 0;
        let occupied: number = 0;

        totalTimeSpans.forEach(timeSpan => {
            free += timeSpan.FreeVaccinations;
            occupied += timeSpan.OccupiedVaccinations;
        });

        let statistics: VAStatistics = new VAStatistics(free, occupied);
        statistics.print(_relativity);
    }
}
