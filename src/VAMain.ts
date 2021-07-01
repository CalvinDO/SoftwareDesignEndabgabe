import { debug } from "webpack";
import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import { VADatabase } from "./VADatabase";
import { VAUserManager } from "./VAUserManager";


startApplication();

function startApplication(): void {
    VADatabase.init();
    new VAUserManager();
}