import axios from "axios";
import { useAuthStore } from "../store/auth-store";

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

export interface Genre {
    genreId: number;
    name: string;
}

export interface Platform {
    platformId: number;
    name: string;
}

export class User {

    constructor(
        public userId: number,
        public firstName: string,
        public lastName: string
    ) {

    }

    public initials(): string {
        return this.firstName[0] + this.lastName[0];
    }

    public fullName(): string {
        return this.firstName + " " + this.lastName;
    }
}

// Values when querying the API for multiple /games/
type API_GameList = {
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

// A "Game" when API was queried for multiple /games
export class GameList implements API_GameList {
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

    public creator: User;

    constructor(
        apiGame: API_GameList,
        protected genreMap: Map<number, string>,
        protected platformMap: Map<number, string>
    ) {
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

        this.creator = new User(this.creatorId, this.creatorFirstName, this.creatorLastName);
    }

    public get creationDate(): string {
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

// Value when querying the API for a single /games/{id}
type API_GameInfo = API_GameList & {
    description: string,
    numberOfWishlists: number,
    numberOfOwners: number
}

type API_Review = {
    reviewerId: number;
    reviewerFirstName: string;
    reviewerLastName: string;
    rating: number;
    review: string;
    timestamp: string;
}

export class Review implements API_Review {
    public reviewerId: number;
    public reviewerFirstName: string;
    public reviewerLastName: string;
    public rating: number;
    public review: string;
    public timestamp: string;

    public reviewer: User;
    private _timestamp: Date;

    constructor(
        apiReview: API_Review
    ) {
        this.reviewerId = apiReview.reviewerId;
        this.reviewerFirstName = apiReview.reviewerFirstName;
        this.reviewerLastName = apiReview.reviewerLastName;
        this.rating = apiReview.rating;
        this.review = apiReview.review;
        this.timestamp = apiReview.timestamp;
        this._timestamp = new Date(this.timestamp);

        this.reviewer = new User(
            this.reviewerId,
            this.reviewerFirstName,
            this.reviewerLastName
        );
    }

    public timestampStr(): string {
        return this._timestamp.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    public reviewerName(): string {
        return this.reviewerFirstName + " " + this.reviewerLastName;
    }
}

// Game details when API was queried for a single /games/{id}
export class GameInfo extends GameList implements API_GameInfo {
    public description: string;
    public numberOfWishlists: number;
    public numberOfOwners: number;

    constructor(
        apiGame: API_GameInfo,
        protected genreMap: Map<number, string>,
        protected platformMap: Map<number, string>
    ) {
        super(apiGame, genreMap, platformMap);
        this.description = apiGame.description;
        this.numberOfWishlists = apiGame.numberOfWishlists;
        this.numberOfOwners = apiGame.numberOfOwners;
    }
}

export namespace Api {

    function getAuth() {
        const { auth } = useAuthStore.getState();
        const isLoggedIn = auth.token !== null && auth.userId !== null;
        if (!isLoggedIn)
            throw new Error("User is not logged in");

        return {
            token: auth.token!,
            userId: auth.userId!,
            authHeaders: {
                "X-Authorization": auth.token!
            }
        }
    }

    export async function getGames(
        allGenres: Genre[],
        allPlatforms: Platform[],
        searchParams: {
            query?: string,
            startIndex?: number,
            count?: number,
            sortBy?: GameSortMethod,
            price?: number,
            creatorId?: number,
            genres?: Genre[],
            platforms?: Platform[],
        }
    ) {

        const params = new URLSearchParams();
        const { query, startIndex, count, sortBy, price, creatorId, genres, platforms } = searchParams;

        if (query)
            params.set("q", query);

        if (startIndex)
            params.set("startIndex", startIndex.toString());

        if (count)
            params.set("count", count.toString());

        if (sortBy)
            params.set("sortBy", sortBy);

        if (price)
            params.set("price", Math.round(price * 100).toString());

        if (creatorId)
            params.set("creatorId", creatorId.toString());

        if (genres)
            for (const genre of genres)
                params.append("genreIds", genre.genreId.toString());

        if (platforms)
            for (const platform of platforms)
                params.append("platformIds", platform.platformId.toString());


        const response = await axios.get(`${BASE_URL}/games`, { params });
        const data = response.data as {
            games: API_GameList[],
            count: number
        }

        const genreMap = _makeGenreMap(allGenres);
        const platformMap = _makePlatformsMap(allPlatforms);
        const games = data.games.map(game => new GameList(game, genreMap, platformMap));
        return {
            games: games,
            count: data.count
        }
    }

    export async function getGameInfo(
        gameId: number,
        allGenres: Genre[],
        allPlatforms: Platform[],
    ) {
        const response = await axios.get(`${BASE_URL}/games/${gameId}`);
        const data = response.data as API_GameInfo;

        const genreMap = _makeGenreMap(allGenres);
        const platformMap = _makePlatformsMap(allPlatforms);
        return new GameInfo(data, genreMap, platformMap);
    }

    function _makeGenreMap(allGenres: Genre[]) {
        return new Map(allGenres.map(x => [x.genreId, x.name]));
    }

    function _makePlatformsMap(allPlatforms: Platform[]) {
        return new Map(allPlatforms.map(x => [x.platformId, x.name]));
    }

    export async function getPlatforms() {
        const response = await axios.get(`${BASE_URL}/games/platforms`);
        return response.data as Platform[];
    }

    export async function getGenres() {
        const response = await axios.get(`${BASE_URL}/games/genres`);
        return response.data as Genre[];
    }

    export function getUserImage(userId: number) {
        return `${BASE_URL}/users/${userId}/image`;
    }

    export function getGameImage(gameId: number) {
        return `${BASE_URL}/games/${gameId}/image`;
    }

    export async function getReviews(
        gameId: number,
    ) {
        const response = await axios.get(`${BASE_URL}/games/${gameId}/reviews`);
        const data = response.data as API_Review[];
        return data.map(x => new Review(x));
    }

    export async function register(
        data: {
            email: string,
            firstName: string,
            lastName: string,
            password: string
        }
    ) {
        const response = await axios.post(`${BASE_URL}/users/register`, data);
        return response.data as {
            userId: number
        };
    }

    export async function login(
        data: {
            email: string,
            password: string
        }
    ) {
        const response = await axios.post(`${BASE_URL}/users/login`, data);
        return response.data as {
            userId: number,
            token: string
        };
    }

    export async function setUserImage(
        image: File
    ) {
        const { userId, authHeaders } = getAuth();
        const response = await axios.put(
            `${BASE_URL}/users/${userId}/image`,
            image,
            {
                headers: {
                    ...authHeaders,
                    "Content-Type": image.type,
                }
            }
        );
    }
}