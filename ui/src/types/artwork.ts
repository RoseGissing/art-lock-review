export interface Artwork {
  id: number;
  title: string;
  artist: string;
  artistAddress: string;
  imageUrl: string;
  description: string;
  ratingCount: number;
  averageScore?: number; // Decrypted average score
  hasRated: boolean; // Whether current user has rated
}
