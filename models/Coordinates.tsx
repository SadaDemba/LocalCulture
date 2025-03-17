export class Coordinates {
  public latitude: number;
  public longitude: number;
  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  public toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
}
