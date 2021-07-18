import { VADate } from "./VADate";
import { VATime } from "./VATime";

export interface VARegistrationData {
    email: string,
    date: VADate,
    startTime: VATime,
    forename: string,
    surname: string,
    birthDate: string,
    phoneNumber: string
    adress: string
}