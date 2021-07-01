import ConsoleHandling from "./ConsoleHandling";
import { VADate } from "./VADate";
import { VATime } from "./VATime";

export class VAAppointmentSalve{
    private date: VADate;
    private startTime: VATime;
    private endTime: VATime;
    private totalVaccinations: number;
    private registeredEmails: string[];


	constructor(_date: VADate, _startTime: VATime, _endTime: VATime, _totalVaccinations: number) {
		this.date = _date;
		this.startTime = _startTime.clone();
		this.endTime = _endTime.clone();
		this.totalVaccinations = _totalVaccinations;
	}

	public print(): void{
		ConsoleHandling.printInput(`Vaccinating ${this.totalVaccinations} people`);
		ConsoleHandling.printInput(`Date: ${this.date.toString()}`);
        ConsoleHandling.printInput(`Time start: ${this.startTime.toString()}`);
        ConsoleHandling.printInput(`Time end: ${this.endTime.toString()}`);
		ConsoleHandling.printInput("");
	}
}