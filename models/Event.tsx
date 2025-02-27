import { Location } from "./Location";

export class Event {
  private readonly id?: string;
  public title: string;
  public description: string;
  public location?: Location;
  public beginDate: string;
  public endDate?: string;
  public author?: string;
  public tags: string[];
  public participants: string[];
  public createdAt?: string;
  public updatedAt?: string;

  constructor(
    title: string,
    description: string,
    beginDate: string,
    author?: string,
    tags: string[] = [],
    participants: string[] = [],
    location?: Location,
    endDate?: string,
    id?: string,
    createdAt?: string,
    updatedAt?: string
  ) {
    this.title = title;
    this.description = description;
    this.location = location;
    this.beginDate = beginDate;
    this.author = author;
    this.tags = tags;
    this.participants = participants;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.endDate = endDate;
    this.id = id;
  }

  public updateEvent(updatedData: Partial<Omit<Event, "id" | "createdAt">>) {
    Object.assign(this, updatedData);
    this.updatedAt = new Date().toISOString();
  }

  public getId() {
    return this.id;
  }
  public toJSON() {
    return {
      title: this.title,
      description: this.description,
      location: this.location?.toJSON() || {},
      beginDate: this.beginDate,
      endDate: this.endDate,
      author: this.author,
      tags: this.tags,
      participants: this.participants,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
