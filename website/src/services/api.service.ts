import axios from "axios";

export enum ApiBaseUrl {
    LocalHost = "http://localhost:4941/api/v1",
    Reference = "https://seng365.csse.canterbury.ac.nz/api/v1",
}

const BASE_URL = ApiBaseUrl.LocalHost;

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

    constructor(apiGame: API_Game) {
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
        // TODO: Use a cached API fetch of genres
        return this.genreId.toString();
    }

    public getPlatforms(): string {
        // TODO: Use a cached value somewhere
        // Maybe lazy load a request on each refresh?but keep using cached value
        return "Mobile, Nintendo Switch, PC, Playstation 5";
    }

    public creatorName(): string {
        return this.creatorFirstName + " " + this.creatorLastName;
    }
}

export namespace Api {

    export type getGamesResponse = {
        games: Game[],
        count: number
    }

    export async function getGames(
        query: string | null
    ): Promise<getGamesResponse> {

        const params = new URLSearchParams();
        if (query)
            params.set("q", query);

        const response = await axios.get(`${BASE_URL}/games`, { params });

        const apiGames = response.data.games as API_Game[];
        return {
            games: apiGames.map(x => new Game(x)),
            count: response.data.count
        }
    }

    export function getGameImage(game: Game) {
        return `${BASE_URL}/games/${game.gameId}/image`;
    }
}