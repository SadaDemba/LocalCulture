export class User {
  private id?: string;
  public firstName: string;
  public lastName: string;
  private email: string;
  private password: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    id?: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.id = id;
  }

  public getEmail() {
    return this.email;
  }

  public getPassword() {
    return this.password;
  }

  public getId() {
    return this.id;
  }
}
