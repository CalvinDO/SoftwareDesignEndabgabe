import { debug } from "webpack";
import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import {VAUserManager} from "./VAUserManager";


startApplication();

function startApplication(): void {
    new VAUserManager();
}