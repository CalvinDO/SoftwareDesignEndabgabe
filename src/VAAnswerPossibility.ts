export class VAAnswerPossibility {
    public answer: string;
    public info: string;
    public blocked: boolean;


    constructor(_answer: string, _info: string, _blocked?: boolean) {
        this.answer = _answer;
        this.info = _info;
        this.blocked = _blocked;
    }
}