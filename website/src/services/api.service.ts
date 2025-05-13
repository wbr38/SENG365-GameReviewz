import axios from "axios";

export enum ApiBaseUrl {
    LocalHost = "http://localhost:4941/api/v1",
    Reference = "https://seng365.csse.canterbury.ac.nz/api/v1",
}

const BASE_URL = ApiBaseUrl.LocalHost;

export enum GameSortMethod {
    ALPHABETICAL_ASC = "ALPHABETICAL_ASC",
    ALPHABETICAL_DESC = "ALPHABETICAL_DESC",
    PRICE_ASC = "PRICE_ASC",
    PRICE_DESC = "PRICE_DESC",
    CREATED_ASC = "CREATED_ASC",
    CREATED_DESC = "CREATED_DESC",
    RATING_ASC = "RATING_ASC",
    RATING_DESC = "RATING_DESC"
}

export interface API_Game {
    gameId: number;
    title: string;
    genreId: number;
    creationDate: string;
    creatorId: number;
    price: number;
    creatorFirstName: string;
    creatorLastName: string;
    rating: number;
    platformIds: number[];
}

export class Game {

    public gameId: number;
    public title: string;
    public genreId: number;
    private _creationDate: Date;
    public creatorId: number;
    public price: number;
    public creatorFirstName: string;
    public creatorLastName: string;
    public rating: number;
    public platformIds: number[];

    constructor(apiGame: API_Game, private genreMap: Map<number, string>, private platformMap: Map<number, string>) {
        this.gameId = apiGame.gameId;
        this.title = apiGame.title;
        this.genreId = apiGame.genreId;
        this._creationDate = new Date(apiGame.creationDate);
        this.creatorId = apiGame.creatorId;
        this.price = apiGame.price;
        this.creatorFirstName = apiGame.creatorFirstName;
        this.creatorLastName = apiGame.creatorLastName;
        this.rating = apiGame.rating;
        this.platformIds = apiGame.platformIds;
    }

    public creationDate(): string {
        return this._creationDate.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    public priceStr(): string {
        if (this.price === 0)
            return "Free";

        return `$${this.price / 100}`;
    }

    public getGenreName(): string {
        return this.genreMap.get(this.genreId) ?? "Unknown Genre";
    }

    public getPlatforms(): string {
        return this.platformIds
            .map(platformId => this.platformMap.get(platformId) ?? "Unknown Platform")
            .join(", ");
    }

    public creatorName(): string {
        return this.creatorFirstName + " " + this.creatorLastName;
    }
}

export namespace Api {

    export type getGamesResponse = {
        games: API_Game[],
        count: number
    }

    export async function getGames(
        query: string | null,
        startIndex?: number,
        count?: number,
        sortBy?: GameSortMethod
    ): Promise<getGamesResponse> {

        const params = new URLSearchParams();
        if (query)
            params.set("q", query);

        if (startIndex)
            params.set("startIndex", startIndex.toString());

        if (count)
            params.set("count", count.toString());

        if (sortBy)
            params.set("sortBy", sortBy);

        const response = await axios.get(`${BASE_URL}/games`, { params });
        return {
            games: response.data.games,
            count: response.data.count
        }
    }

    export async function getPlatforms() {
        const response = await axios.get(`${BASE_URL}/games/platforms`);

        interface Platform {
            platformId: number;
            name: string;
        }

        return response.data as Platform[];
    }

    export async function getGenres() {
        const response = await axios.get(`${BASE_URL}/games/genres`);

        interface Genre {
            genreId: number;
            name: string;
        }
        return response.data as Genre[];
    }

    export function getGameImage(game: Game) {
        return `${BASE_URL}/games/${game.gameId}/image`;
    }
}