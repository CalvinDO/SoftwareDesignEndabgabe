import ConsoleHandling from "./ConsoleHandling";

export class VAImpfling {
    constructor() {
       this.startMenuLoop();
    }

    private async startMenuLoop(): Promise<void>{
        while(await this.startMenu());
    }

    private async startMenu(): Promise<boolean> {
        switch ((await ConsoleHandling.showPossibilities(["See Overview of free dates (O)", "Search for a specific day to see it's detail (S)", "Register in waiting list (W)"], "Hello Impfling! :) What do you want to do?")).toUpperCase()) {
            case "O":
                this.overviewDays();
                return false;
            case "S":
                this.searchDay();
                return false;
            case "R":
                this.registerInWaitingList();
                return false;
            default:
                ConsoleHandling.printInput("Invalid input! Please try again!");
                break;
        }

        return true;
    }

    private overviewDays(): void{

    }

    private searchDay(): void{

    }

    private registerInWaitingList(): void{

    }
}