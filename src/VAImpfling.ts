import ConsoleHandling from "./ConsoleHandling";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VADatabase } from "./VADatabase";
import { VADate } from "./VADate";

export class VAImpfling {
    constructor() {
        this.startMenuLoop();
    }

    private async startMenuLoop(): Promise<void> {
        ConsoleHandling.printInput("Hello Impfling :)")
        this.startMenu();
    }

    private async startMenu(): Promise<void> {
        try {


            switch ((await ConsoleHandling.showPossibilities(["See Overview of free dates (O)", "Search for a specific day to see it's detail (S)", "Register in waiting list (W)"], "What do you want to do?")).toUpperCase()) {
                case "O":
                    await this.overviewDays();
                    break;
                case "S":
                    this.searchDay();
                    break;
                case "R":
                    this.registerInWaitingList();
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
        await this.startMenu();
    }

    private async overviewDays(): Promise<void> {
        ConsoleHandling.printInput("You chose to overview the free dates of all days");

        let answer: string = await ConsoleHandling.getChosenPossibilityAnswer(VADatabase.getCompactDaysPossibilities(), "Above you can see an overview of the vaccinations! \nIf you want to inspect further detail of a specific day, type in the date of it! \nIf not, just type 'exit'");
        let date: VADate = new VADate(answer);
        let day: VAAppointmentDay = VADatabase.getAppointmentDay(date);

        day.show();

        let wantRegisterString: string = await ConsoleHandling.showPossibilities(["Y"], `This day has ${day.AmountFreeDates} free vaccination dates! Do you want to register for it?`);

    }

    private searchDay(): void {

    }

    private registerInWaitingList(): void {

    }
}