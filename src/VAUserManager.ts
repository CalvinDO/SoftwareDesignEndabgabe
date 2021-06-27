import ConsoleHandling from "./ConsoleHandling";
import { VAAdministrator } from "./VAAdministrator";
import { VAUser } from "./VAUser";

export class VAUserManager {

    private currentUser: VAUser;

    constructor() {
        
        this.askForLogin();
    }

    private async askForLogin(): Promise<boolean> {
        switch (await ConsoleHandling.showPossibilities(["Yes (Y)", "No (N)"], "Hello User! Are you the administrator?")) {
            case "Y":
                ConsoleHandling.printInput("Please type in your username and password to verify that you are the administrator!");

                if (await this.signIn(await ConsoleHandling.question("username:"), await ConsoleHandling.question("password:"))) {
                    this.currentUser = new VAAdministrator();
                } else{
                    ConsoleHandling.printInput("username or password is wrong! returning to the login screen.");
                    this.askForLogin();
                }
                break;
            case "N":
                break;
            default:
                break;
        }
        return true;
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
