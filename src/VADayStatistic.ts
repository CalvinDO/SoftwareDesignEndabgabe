import ConsoleHandling from "./ConsoleHandling";
import { VATimeRelativity } from "./VATimeRelativity";

export class VADayStatistic {
    private free: number;
    private occupied: number;

    constructor(_free: number, _occupied: number) {
        this.free = _free;
        this.occupied = _occupied;
    }

    public print(_relativity: VATimeRelativity): void {

        let isPast: boolean = _relativity == VATimeRelativity.Past;

        ConsoleHandling.printInput(`├── ${this.free} ${isPast ? "unused" : "free"}`);
        ConsoleHandling.printInput(`└── ${this.free} ${isPast ? "vaccinated" : "occupied"}`);
    }
}