export interface DB_GameReview {
    id: number;
    game_id: number;
    user_id: number;
    rating: number;
    review?: string;
    timestamp: Date;
}

export interface API_GameReview {
    reviewerId: number;
    rating: number;
    review?: string;
    reviewerFirstName: string;
    reviewerLastName: string;
    timestamp: Date;
}
