import GiftIcon from '@mui/icons-material/CardGiftcard';
import GameControllerIcon from "@mui/icons-material/VideogameAsset";
import { Card, CardContent, CardHeader, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import UserAvatar from "../components/UserAvatar";
import { Api, GameInfo, GameList, Genre, Platform, Review } from "../services/api.service";

const iconStyle = {
    verticalAlign: "middle",
    marginRight: "0.5ch",
};

const imageStyle = {
    width: "18em"
}

function SimilarGames(props: {
    games: GameList[],
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
}) {
    const { page, setPage } = props;

    const GAMES_PER_PAGE = 3;
    const totalNumGames = props.games.length;
    const NUM_PAGES = Math.ceil(totalNumGames / GAMES_PER_PAGE);
    const games = props.games.slice((page - 1) * GAMES_PER_PAGE, page * GAMES_PER_PAGE);

    return (
        <div>
            <Typography gutterBottom variant="h4" component="div" style={{ margin: "1em 0" }}>
                Similar Games
            </Typography>

            {/* Similar games */}
            <div style={{
                display: "flex",
                // flexWrap: "wrap",
                overflow: "scroll",
                justifyContent: "center",
                gap: "0 1em"
            }}>
                {games.map((game) => (
                    <GameCard key={game.gameId} game={game} />
                ))}

            </div>

            {/* Pagination */}
            {
                totalNumGames > GAMES_PER_PAGE
                && (
                    <div style={{
                        display: "flex",
                        overflow: "scroll",
                        justifyContent: "center",
                        // justifyContent: "left",
                        marginTop: "1em"
                    }}>
                        <Pagination
                            count={NUM_PAGES}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </div>
                )
            }
        </div>
    );
}

function ReviewsSection(props: { reviews: Review[] }) {
    const { reviews } = props;
    return (
        <div>
            <Typography gutterBottom variant="h4" component="div">
                Reviews
            </Typography>

            {/* ReviewCard */}
            <div>
                {reviews.map((review) => (
                    <Card sx={{
                        minWidth: 275,
                        textAlign: "left",
                        margin: "1em 0"
                    }}>
                        <CardHeader
                            avatar={
                                <UserAvatar user={review.reviewer} size={40} />
                            }
                            title={review.reviewerName()}
                            subheader={review.timestampStr()}
                        />

                        <CardContent sx={{ paddingTop: 0 }}>
                            <Typography variant="h5" component="div">
                                {review.rating}/10
                            </Typography>

                            <Typography variant="body2">
                                {review.review}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function Game() {
    const params = useParams();

    const gameId = Number(params.id!);

    const [game, setGame] = useState<GameInfo | null>(null);
    const [similarGamesPage, setSimilarGamesPage] = useState(1);
    const [similarGames, setSimilarGames] = useState<GameList[] | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);

    const [allGenres, setAllGenres] = useState<Genre[] | null>(null);
    const [allPlatforms, setAllPlatforms] = useState<Platform[] | null>(null);
    useEffect(() => {
        async function fetchGenresAndPlatforms() {
            try {
                const [genresResponse, platformsResponse] = await Promise.all([
                    Api.getGenres(),
                    Api.getPlatforms(),
                ]);
                setAllGenres(genresResponse);
                setAllPlatforms(platformsResponse);
            } catch (err) {
                console.log("Error fetching genres and platforms:", err);
            }
        }

        // Only fetch once
        if (!allGenres || !allPlatforms)
            fetchGenresAndPlatforms();
    }, []); // empty dependency array to only call once on page load

    // Fetch Game
    useEffect(() => {
        if (isNaN(gameId)) return;

        async function fetchGame() {
            // Genres or platforms hasn't loaded yet
            if (!allGenres || !allPlatforms) return;

            try {
                const gameResponse = await Api.getGameInfo(gameId, allGenres, allPlatforms);
                setGame(gameResponse);
            } catch (error) {
                // TODO: mui snackbar (for 404)
                console.log(error);
            }
        };

        fetchGame();
    }, [gameId, allGenres, allPlatforms])

    // Fetch similar games
    useEffect(() => {
        if (isNaN(gameId)) return;

        async function fetchSimilarGames() {
            // Genres, platforms, or game hasn't loaded yet
            if (!allGenres || !allPlatforms || !game) return;

            try {
                const [similarGenreGames, similarCreatorGames] = await Promise.all([
                    Api.getGames(allGenres, allPlatforms, {
                        genres: allGenres.filter(genre => genre.genreId === game.genreId)
                    }),
                    Api.getGames(allGenres, allPlatforms, {
                        creatorId: game.creatorId
                    }),
                ]);

                const duplicates = new Set<number>();
                let similarGames = [...similarGenreGames.games, ...similarCreatorGames.games]
                    .filter(x => {
                        // Don't include the current game
                        if (x.gameId === game.gameId)
                            return false;

                        // Remove duplicates
                        if (duplicates.has(x.gameId))
                            return false;
                        duplicates.add(x.gameId);

                        return true;

                    });

                setSimilarGames(similarGames);
            } catch (error) {
                // TODO: mui snackbar (for 404)
                console.log(error);
            }
        };

        fetchSimilarGames();
    }, [gameId, allGenres, allPlatforms, game])

    // Fetch Reviews
    useEffect(() => {
        async function fetchReviews() {
            if (!game) return;
            const reviews = await Api.getReviews(game.gameId);
            setReviews(reviews);
        }

        fetchReviews();
    }, [game]);

    if (isNaN(gameId))
        return <pre>Invalid game ID: {params.id}</pre>

    if (!game)
        return <pre>Loading...</pre>

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 3fr",
                gap: "2em",
                width: "70vw",
                margin: "auto"
            }}
        >
            {/* Game Image (Left) */}
            <div style={{
                gridColumn: 1,
                gridRow: 1,
                height: "0"
            }}>
                <img style={{ ...imageStyle }}
                    src={Api.getGameImage(gameId)} alt=""
                />
            </div>

            {/* Game Details (Right) */}
            <div style={{
                textAlign: "left",
                gridColumn: 2,
                gridRow: "1/3",
            }}>
                <Typography gutterBottom variant="h3" component="div">
                    {game.title}
                </Typography>

                <p>
                    Released on {game.creationDate} by {game.creatorName()}
                </p>

                <p>
                    {game.description}
                </p>

                <p>
                    Platforms: {game.getPlatforms()}
                </p>

                <p>
                    Genre: {game.getGenreName()}
                </p>

                <div style={{ display: "flex" }}>
                    <p style={{ margin: "0 1em 0 0" }}><GameControllerIcon sx={iconStyle} />{game.numberOfOwners} Users own this game</p>
                    <p style={{ margin: "0" }}><GiftIcon sx={iconStyle} />{game.numberOfWishlists} Users wishlisted</p>
                </div>

                {similarGames &&
                    <SimilarGames
                        games={similarGames}
                        page={similarGamesPage}
                        setPage={setSimilarGamesPage}
                    />
                }
            </div>

            {/* Creator Name & Image (left) */}
            <div style={{
                gridColumn: 1,
                gridRow: 2,
            }}>
                <UserAvatar user={game.creator} size={280} variant="square" />
                <p style={{ margin: 0 }}>Creator: {game.creatorName()}</p>
            </div>

            {/* Rating number (left) */}
            <div style={{
            }}
            >
                <p>Overall Rating</p>
                <Typography gutterBottom variant="h2" component="div" style={{ margin: 0 }}>
                    {game.rating}
                </Typography>
            </div>

            {
                reviews &&
                <ReviewsSection reviews={reviews} />
            }

        </div>
    );
}
