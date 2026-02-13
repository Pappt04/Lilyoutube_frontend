export interface WatchPartyMember {
  userId: number;
  username: string;
  joinedAt: Date;
}

export interface WatchParty {
  id: number;
  roomCode: string;
  creatorId: string;
  creatorUsername: string;
  currentVideoId?: number;
  currentVideoTitle?: string;
  publicRoom: boolean;
  active: boolean;
  createdAt: Date;
  members: WatchPartyMember[];
  memberCount: number;
}

export interface CreateWatchPartyRequest {
  publicRoom: boolean;
}

export interface JoinWatchPartyRequest {
  roomCode: string;
}
