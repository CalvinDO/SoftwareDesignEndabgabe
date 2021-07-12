import { F_OK } from "constants";
import ConsoleHandling from "./ConsoleHandling";
import FileHandler from "./FileHandler";
import { VAAppointmentDay } from "./VAAppointmentDay";
import { VADate } from "./VADate";

export class VADatabase {
    public static appointmentDB: VAAppointmentDay[];


    public static addDay(_appointmentDay: VAAppointmentDay): void {

        if (_appointmentDay.isNewInstance) {
            this.appointmentDB.push(_appointmentDay);
        }

        this.DBToJSON();
    }

    public static getAppointmentDay(_date: VADate): VAAppointmentDay {

        for (let day of this.appointmentDB) {
            
            if (day.isOnSameDateLike(_date)) {
                return day;
            }
        }

        return null;
    }

    public static init(): void {

        try {
            this.JSONToDB()
        } catch (error) {
            if (error.message == "Unexpected end of JSON input") {
                this.appointmentDB = [];
            } else {
                throw error;
            }
        }

        this.printDB();
    }

    private static printDB(): void {
        ConsoleHandling.printInput(JSON.stringify(this.appointmentDB));
    }

    private static DBToJSON(): void {
        FileHandler.writeFile("appointmentDB.json", this.appointmentDB);
    }

    private static JSONToDB(): void {

        let dumbAppointmentDB: VAAppointmentDay[] = <VAAppointmentDay[]>FileHandler.readObjectFile("appointmentDB.json");
        let smartAppointmentDB: VAAppointmentDay[] = [];
        dumbAppointmentDB.forEach(dumbday => {
            smartAppointmentDB.push(VAAppointmentDay.dumbToSmartDay(dumbday));
        })

        this.appointmentDB = smartAppointmentDB;
    }
}