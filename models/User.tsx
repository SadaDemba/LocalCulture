export class User {
  private readonly id?: string;
  public firstName: string;
  public lastName: string;
  private email: string;
  public profilePicture: string;
  public bio: string;
  public interests: string[];
  public createdAt?: string;
  public updatedAt?: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    profilePicture: string = "",
    bio: string = "",
    interests: string[] = [],
    id?: string
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.profilePicture = profilePicture;
    this.bio = bio;
    this.interests = interests;
    this.id = id;
  }

  public getEmail() {
    return this.email;
  }

  public getId() {
    return this.id;
  }
}
