import { VADatabase } from "../VADatabase";


describe("This is a simple test", () => {
    test("Check the Mailaddress function", () => {
        console.log("test");
        expect(VADatabase.isPhoneNumber("+49 177 7576 167")).toBe(true);
    });
});


