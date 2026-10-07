export type RelationStatus = 'NONE' | 'FRIEND' | 'REQUEST_SENT' | 'REQUEST_RECEIVED';

export interface FriendUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  elo: number;
  online: boolean;
}

export interface SearchResult extends Omit<FriendUser, 'online'> {
  relation: RelationStatus;
}

export interface FriendRequest {
  id: string;
  user: FriendUser; // l'autre personne (expéditeur ou destinataire)
  createdAt: string;
}

export interface FriendRequests {
  received: FriendRequest[];
  sent: FriendRequest[];
}