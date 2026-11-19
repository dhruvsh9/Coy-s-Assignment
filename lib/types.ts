export type SwipeDirection = "like" | "pass";

export type SwipeGesture = "left" | "right";

export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  college?: string;
  interests: string[];
}

export interface CurrentUser {
  id: string;
  name: string;
  age: number;
  photo: string;
}

export interface SwipeRecord {
  id: string;
  profileId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  profileId: string;
  matchedAt: string;
}

export interface Database {
  version: number;
  currentUser: CurrentUser;
  profiles: Profile[];
  /** Kept server-side only. These IDs are never returned unless a match is mutual. */
  incomingLikes: string[];
  swipes: SwipeRecord[];
  matches: MatchRecord[];
}

export interface Match {
  id: string;
  matchedAt: string;
  profile: Profile;
}

export interface FeedResponse {
  profiles: Profile[];
}

export interface SwipeResponse {
  matched: boolean;
  match?: Match;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface ApiError {
  error: string;
  code?: string;
}
