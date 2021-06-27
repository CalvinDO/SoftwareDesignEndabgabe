import ConsoleHandling from "./ConsoleHandling";

export class VAImpfling {
    constructor() {
        while(this.startMenu()){
            
        }
    }

    private async startMenu(): Promise<boolean> {
        switch (await ConsoleHandling.showPossibilities(["See Overview of free dates (O)", "Search for a specific day to see it's detail (S)", "Register in waiting list (W)"], "Hello Impfling! :) What do you want to do?")) {
            case "O":
                break;
            case "S":
                break;
            case "R":
                break;
            default:
                ConsoleHandling.printInput("unkown input! please try again!");
                break;
        }

        return true;
    }
}