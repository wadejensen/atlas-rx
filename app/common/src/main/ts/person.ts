export class Person {
    readonly name: string;
    readonly age: number;
    readonly occupation: string;
    readonly salary: number;

    constructor(name: string, age: number, occupation: string, salary: number) {
        this.name = name;
        this.age = age;
        this.occupation = occupation;
        this.salary = salary;
    }
}
