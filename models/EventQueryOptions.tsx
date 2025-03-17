interface EventQueryOptions {
  userEvents?: UserEvents;
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  limit?: number;
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
}

const enum UserEvents {
  "current",
  "all",
  "others",
}
