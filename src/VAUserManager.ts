import ConsoleHandling from "./ConsoleHandling";
import { VAAdministrator } from "./VAAdministrator";
import { VAImpfling } from "./VAImpfling";
import { VAUser } from "./VAUser";

export class VAUserManager {

    private currentUser: VAUser;

    constructor() {
        this.askForLogin();
    }

    private async askForLogin(): Promise<void> {
        try {
            switch ((await ConsoleHandling.showPossibilities(["Yes (Y)", "No (N)"], "Hello User! Welcome to the Vaccation Appointment Application!\nType 'exit' to exit at any time!\nAre you the administrator?")).toUpperCase()) {
                case "Y":

                    ConsoleHandling.printInput("Please type in your username and password to verify that you are the administrator!");

                    if (await this.signIn(await ConsoleHandling.question("username:"), await ConsoleHandling.question("password:"))) {

                        this.currentUser = new VAAdministrator();
                    } else {

                        ConsoleHandling.printInput("username or password is wrong! returning to the login screen.");
                        await this.askForLogin();
                    }

                    return;

                case "N":
                    this.currentUser = new VAImpfling();
                    return;
                default:
                    ConsoleHandling.printInput("");
                    ConsoleHandling.printInput("Invalid input! Please try again!");
                    ConsoleHandling.printInput("");
                    break;
            }
        } catch (error: any) {

            if (error.message == "exit") {

                ConsoleHandling.printInput("");
                ConsoleHandling.printInput("You chose to exit!");
                ConsoleHandling.printInput("");

            } else {
                ConsoleHandling.printInput("Unkown system error! " + error.message);
            }
        }

        ConsoleHandling.printInput("Returning to start screen");

        await this.askForLogin();
    }

    private async signIn(_name: string, _password: string): Promise<boolean> {

        if (_name != VAAdministrator.username) {
            return false;
        }
        
        if (_password != VAAdministrator.password) {
            return false;
        }

        return true;
    }
}
