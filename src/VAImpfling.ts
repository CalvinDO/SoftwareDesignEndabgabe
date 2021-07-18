import { start } from "repl";
import ConsoleHandling from "./ConsoleHandling";
import { VAAnswerPossibility } from "./VAAnswerPossibility";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VADatabase } from "./VADatabase";
import { VADate } from "./VADate";
import { VATime } from "./VATime";
import { VARegistrationData } from "./RegistrationData";
import { VATimeSpan } from "./VATimeSpan";

export class VAImpfling {

    private currentRegistrationDay: VAAppointmentDay;
    private currentTimeSpan: VATimeSpan;


    private startMenuPossibilities: VAAnswerPossibility[] = [new VAAnswerPossibility("O", " See Overview of vaccinations "), new VAAnswerPossibility("S", "Search for a specific day to see it's detail")];

    constructor() {
        ConsoleHandling.printInput("Hello Impfling :)");

        if (VADatabase.areNoFreeDatesAvailable()) {
            this.startMenuPossibilities.push(new VAAnswerPossibility("R", "Register in waiting list"))
        }
        this.startMenu();
    }

    private async startMenu(): Promise<void> {
        if (this.startMenuPossibilities.length > 2) {
            ConsoleHandling.printInput("There are no free vaccinations, but you can register in a waiting list!");
        }
        try {

            switch (await ConsoleHandling.getChosenPossibilityAnswer(this.startMenuPossibilities, "What do you want to do?")) {
                case "O":
                    await this.overviewDays();
                    break;
                case "S":
                    await this.searchDay();
                    break;
                case "R":
                    await this.registerInWaitingList();
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

        await this.continueWithSelectedDay(day);

        ConsoleHandling.printInput("You will get back to the overview. If you want to stop, type 'exit'");
        return await this.overviewDays();
    }

    private async continueWithSelectedDay(day: VAAppointmentDay): Promise<void> {
        day.show();

        if (day.AmountFreeDates <= 0) {
            ConsoleHandling.printInput("Sorry, this day has no free dates to register for");
            ConsoleHandling.printInput("You will get back to the overview. If you want to stop, type 'exit'");
            return await this.overviewDays();
        }

        let wantRegister: boolean = await ConsoleHandling.yesNoPossibilities(`This day has ${day.AmountFreeDates} free vaccination dates! Do you want to register for it?`);

        if (wantRegister) {

            let regData: VARegistrationData = await this.getRegistrationDataForDay(day);
            this.currentTimeSpan.registerEmail(regData.email);

            VADatabase.addRegistrationData(regData);

            ConsoleHandling.printInput("You are successfully registered for this vaccination! Congratulations and stay healthy ");
            this.currentRegistrationDay = null;
            this.currentTimeSpan = null;
            ConsoleHandling.printInput("You will now come back to the start menu");

            return;
        }
    }

    private async getRegistrationDataForDay(day: VAAppointmentDay, waiting?: boolean): Promise<VARegistrationData> {
        this.currentRegistrationDay = day;

        this.currentTimeSpan = <VATimeSpan>await this.getRegistrationDataOf("startTime", waiting);
        let email: string = <string>await this.getRegistrationDataOf("email", waiting);
        let forename: string = <string>await this.getRegistrationDataOf("forename", waiting);
        let surname: string = <string>await this.getRegistrationDataOf("surname", waiting);
        let birthDate: string = <string>await this.getRegistrationDataOf("birthDate", waiting);
        let phoneNumber: string = <string>await this.getRegistrationDataOf("phoneNumber", waiting);
        let adress: string = <string>await this.getRegistrationDataOf("adress", waiting);

        return { email: email, date: this.currentRegistrationDay.date, startTime: this.currentTimeSpan.StartTime, forename: forename, surname: surname, birthDate: birthDate, phoneNumber: phoneNumber, adress: adress };
    }

    private async getRegistrationDataOf(_dataSpecification: string, waiting?: boolean): Promise<VATimeSpan | VATime | string | VADate> {

        try {

            switch (_dataSpecification) {
                case "startTime":

                    let startTime: VATime = new VATime(await ConsoleHandling.question("Pleae type in the start time you want to register for in the following format: HH:MM "));

                    if (waiting) {
                        return startTime;
                    }

                    let foundSpan: VATimeSpan = this.currentRegistrationDay.findSpanByStartTime(startTime);

                    if (!foundSpan) {
                        throw new Error("Your input start time is either occupied or doesn't show up at your selected day!");
                    }

                    return foundSpan;
                case "email":

                    let email: string = await ConsoleHandling.question("Pleae type in your email: ");

                    if (!VADatabase.emailRegex.test(email)) {
                        throw new Error("Your email is not a valid email!");
                    }

                    if (VADatabase.isEmailAlreadyUsed(email)) {
                        throw new Error("Your email is already in use! You can only register for one vaccination!");
                    }

                    return email;
                case "forename":
                case "surname":

                    let name: string = await ConsoleHandling.question(`Please type in the ${_dataSpecification}: `);
                    if (!VADatabase.nameRegex.test(name)) {
                        throw new Error("Your name contains invalid characters!");
                    }
                    return name;

                case "birthDate":

                    let birthDay: VADate = new VADate(await ConsoleHandling.question("Please type in your birthdate in the following format: DD(.-/)MM(.-/)YYYY "));
                    return birthDay;

                case "phoneNumber":

                    let phoneNumberString: string = await ConsoleHandling.question("Please type in your phone number: ");

                    if (!VADatabase.isPhoneNumber(phoneNumberString)) {
                        throw new Error("Your phone number is invalid!");
                    }
                    return phoneNumberString;
                case "adress":

                    let adress: string = await ConsoleHandling.question("Please type in your whole adress: ");
                    return adress;
                default:

                    break;
            }
        } catch (error: any) {
            if (error.message == "exit") {
                throw new Error("exit");
            } else {
                ConsoleHandling.printInput(error.message);
                ConsoleHandling.printInput("Please try again, or type 'exit' at any time to leave");
            }
        }

        return await this.getRegistrationDataOf(_dataSpecification);
    }

    private async searchDay(): Promise<void> {
        ConsoleHandling.printInput("You chose to search for a specific day!");

        let answer: string = await ConsoleHandling.getChosenPossibilityAnswer(VADatabase.getCompactDaysPossibilities(), "Above you can see the dates to search for. Just type in the date in the following format:  DD(.-/)MM(.-/)YYYY \nIf you want to leave, just type 'exit'");
        let date: VADate = new VADate(answer);
        let day: VAAppointmentDay = VADatabase.getAppointmentDay(date);

        await this.continueWithSelectedDay(day);

        ConsoleHandling.printInput("You will get back to the searchDay Interface. If you want to stop, type 'exit'");
        return await this.searchDay();
    }

    private async registerInWaitingList(): Promise<void> {
        ConsoleHandling.printInput("You chose to register in the waiting list!");

        let day: VAAppointmentDay = new VAAppointmentDay(await this.getWaitingDay());


        let regData: VARegistrationData = await this.getRegistrationDataForDay(day, true);
        VADatabase.addWaitingRegistrationData(regData);
    }

    private async getWaitingDay(): Promise<VADate> {
        try {
            let date: VADate = new VADate(await ConsoleHandling.question("Please type in the date you want to get vaccinated in the following format:  DD(.-/)MM(.-/)YYYY"));
            return date;
        } catch (error: any) {
            if (error.message == "exit") {
                throw new Error("exit");
            } else {
                ConsoleHandling.printInput(error.message);
                ConsoleHandling.printInput("Please try again, or type 'exit' at any time to leave");
            }
        }
    }
}