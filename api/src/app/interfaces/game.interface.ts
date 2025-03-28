// Game entity as defined by the database
export interface DBGame {
    id: number;
    title: string;
    description: string;
    creation_date: string;
    image_filename?: string;
    creator_id: number;
    genre_id: number;
    price: number;
}

type DateTimeOutput = string;

// Game entity as defined by the API
export interface APIGame {
    gameId: number;
    title: string;
    genreId: number;
    creatorId: number;
    creatorFirstName: string;
    creatorLastName: string;
    price: number;
    rating: number;
    platformIds: number[];
    creationDate: DateTimeOutput;
}

export interface PostGame {
    title: string;
    description: string;
    genreId: number;
    price: number;
    platformIds: number[];
}