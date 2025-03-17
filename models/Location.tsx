import { Coordinates } from "./Coordinates";

export class Location {
  public name: string;
  public address: string;
  public coordinates: Coordinates;

  constructor(name: string, address: string, coordinates: Coordinates) {
    this.name = name;
    this.address = address;
    this.coordinates = coordinates;
  }

  public toJSON() {
    return {
      name: this.name,
      address: this.address,
      coordinates: this.coordinates.toJSON,
    };
  }
}
