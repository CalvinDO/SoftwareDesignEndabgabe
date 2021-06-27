import ConsoleHandling from "./ConsoleHandling";
import { VAUser } from "./VAUser";
export class VAAdministrator extends VAUser {
    public static username: string = "MaxDerBoss";
    public static password: string = "ichbinboss";

    constructor() {
        super();
        this.startMenuLoop();
    }

    private async startMenuLoop(): Promise<void> {
        while (await this.startMenu()) {

        }
    }
    
    private async startMenu(): Promise<boolean> {
        switch (await ConsoleHandling.showPossibilities(["Create Appointments (C)", "Select a day to display detail (D)", "View Statistics (S)"], `Hello ${VAAdministrator.username} ! :) What do you want to do?`)) {
            case "C":
                return false;
            case "D":
                return false;
            case "S":
                return false;
            default:
                ConsoleHandling.printInput("unkown input! please try again!");
                break;
        }

        return true;
    }
}
