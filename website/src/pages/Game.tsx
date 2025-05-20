import GiftIcon from "@mui/icons-material/CardGiftcard";
import GameControllerIcon from "@mui/icons-material/VideogameAsset";
import { Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Pagination, Rating, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import { useSnackbar } from "../components/SnackBar";
import UserAvatar from "../components/UserAvatar";
import { Api, GameInfo, GameList, Genre, Platform, Review } from "../services/api.service";
import { useAuthStore } from "../store/auth-store";

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

function ReviewButton(props: {
    game: GameInfo,
    reviews: Review[],
    fetchReviews: () => Promise<void>
}) {
    const { game, reviews, fetchReviews } = props;
    const { showSnackMessage } = useSnackbar();

    // Buttons
    const navigate = useNavigate();
    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;
    const ownsGame = game.creatorId === authState.userId
    const alreadyReviewed = reviews.some((review) => review.reviewerId === authState.userId);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    // Modal content
    const [reviewStars, setReviewStars] = useState(5);
    const [reviewMessage, setReviewMessage] = useState("");

    // Must be logged in
    if (!isLoggedIn)
        return (
            <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/login")}
            >
                Log in to leave a review
            </Button>
        );

    // Cannot review own created game
    if (ownsGame)
        return (
            <Button
                variant="outlined"
                disabled
            >
                Cannot review your own game
            </Button>
        );

    // Game is already reviewed
    if (alreadyReviewed)
        return (
            <Button
                variant="outlined"
                disabled
            >
                Game already reviewed
            </Button>
        );

    async function tryPublishReview() {
        // Only set reviewText if the reviewMessage is not an empty string
        // Otherwise set it to undefined for API (api will error if == "")
        const reviewText = reviewMessage.length > 0 ? reviewMessage : undefined;

        try {
            await Api.reviewGame(
                game.gameId,
                reviewStars,
                reviewText
            );
            closeModal();
            fetchReviews(); // rerender reviews
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    return (
        <>
            {/* Click to open dialog button */}
            <Button
                variant="outlined"
                onClick={openModal}
            >
                Add Your Review
            </Button>

            {/* Pop up Dialog */}
            <Dialog
                open={modalOpen}
                onClose={closeModal}
            >
                <DialogTitle>
                    Leave a Review
                </DialogTitle>

                <DialogContent>
                    <h1 style={{ margin: 0 }}>{game.title}</h1>

                    <div>
                        <Typography>{reviewStars}/10 stars</Typography>
                        <Rating
                            value={reviewStars}
                            onChange={(event, newValue) => {
                                if (newValue)
                                    setReviewStars(newValue);
                            }}
                            max={10}
                        />
                    </div>

                    <TextField
                        id="outlined-multiline-static"
                        label="Message (Optional)"
                        multiline
                        rows={4}
                        sx={{
                            width: "25vw",
                            margin: "1em 0"
                        }}
                        value={reviewMessage}
                        onChange={(event) => setReviewMessage(event.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={tryPublishReview} autoFocus>
                        Publish Review
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function ReviewsSection(props: {
    game: GameInfo,
    reviews: Review[],
    fetchReviews: () => Promise<void>
}) {
    const { reviews, game, fetchReviews } = props;
    return (
        <div>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
            }}>
                <Typography
                    variant="h3"
                    component="div"
                >
                    Reviews
                </Typography>

                <ReviewButton fetchReviews={fetchReviews} reviews={reviews} game={game} />
            </div>

            {/* ReviewCard */}
            <div>
                {reviews.map((review) => (
                    <Card
                        key={review.reviewerId}
                        sx={{
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

function WishlistButton(props: {
    isLoggedIn: boolean,
    isCreator: boolean,
    isWishlisted: boolean | null,
    isOwned: boolean | null,
    wishlistGame: () => any,
    unwishlistGame: () => any
}) {
    const { isLoggedIn, isCreator, isWishlisted, isOwned, wishlistGame, unwishlistGame } = props;

    if (isCreator)
        return (
            <Button
                variant="outlined"
                startIcon={<GiftIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                disabled
            >
                Can't wishlist a game you made
            </Button>
        );

    if (!isLoggedIn)
        return (
            <Button
                variant="outlined"
                startIcon={<GiftIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                disabled
            >
                Log in to wishlist
            </Button>
        );

    // If game is owned then we cannot wishlist the game
    if (isOwned)
        return (
            <Button
                variant="outlined"
                startIcon={<GiftIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                loading={isWishlisted == null}
                disabled
            >
                Game is owned; can't wishlist
            </Button>
        );

    if (isWishlisted)
        return (
            <Button
                variant="outlined"
                startIcon={<GiftIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                onClick={unwishlistGame}
                color="secondary"
            >
                Remove from wishlist
            </Button>
        );

    return (
        <Button
            variant="outlined"
            startIcon={<GiftIcon sx={iconStyle} />}
            style={{ marginBottom: "1em" }}
            onClick={wishlistGame}
            loading={isWishlisted == null}
            disabled={isWishlisted == null}
        >
            Add to wishlist
        </Button>
    )
}

function OwnedButton(props: {
    isLoggedIn: boolean,
    isCreator: boolean,
    isOwned: boolean | null,
    markGameOwned: () => any,
    unmarkGameOwned: () => any
}) {

    const { isCreator, isLoggedIn, isOwned, markGameOwned, unmarkGameOwned } = props;

    if (isCreator)
        return (
            <Button
                variant="outlined"
                startIcon={<GameControllerIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                disabled
            >
                Can't own a game you made
            </Button>
        );

    if (!isLoggedIn)
        return (
            <Button
                variant="outlined"
                startIcon={<GameControllerIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                disabled
            >
                Log in to mark as owned
            </Button>
        );

    if (isOwned)
        return (
            <Button
                variant="outlined"
                startIcon={<GameControllerIcon sx={iconStyle} />}
                style={{ marginBottom: "1em" }}
                onClick={unmarkGameOwned}
                color="secondary"
            >
                Unmark game as owned
            </Button>
        );

    return (
        <Button
            variant="outlined"
            startIcon={<GameControllerIcon sx={iconStyle} />}
            style={{ marginBottom: "1em" }}
            onClick={markGameOwned}
            loading={isOwned == null}
            disabled={isOwned == null}
        >
            Mark game as owned
        </Button>
    );
}

function WishlistOwnedButtons(props: {
    game: GameInfo,
    allGenres: Genre[],
    allPlatforms: Platform[]
}) {
    const { showSnackMessage } = useSnackbar();
    const { game, allGenres, allPlatforms } = props;
    const [isWishlisted, setIsWishlisted] = useState<boolean | null>(null);
    const [isOwned, setIsOwned] = useState<boolean | null>(null);

    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;
    const isCreator = game.creatorId === authState.userId;

    async function checkIfOwned() {
        const wishlistedGames = await Api.getGames(allGenres, allPlatforms, {
            ownedByMe: true
        });

        setIsOwned(wishlistedGames.games.some((x) => x.gameId === game.gameId));
    }

    async function checkIsWishlisted() {
        const wishlistedGames = await Api.getGames(allGenres, allPlatforms, {
            wishlistedByMe: true
        });

        setIsWishlisted(wishlistedGames.games.some((x) => x.gameId === game.gameId));
    }

    function reloadButtons() {
        if (!isLoggedIn) return;
        setIsWishlisted(null);
        setIsOwned(null);
        checkIsWishlisted();
        checkIfOwned();
    }

    // Is game already wishlisted
    useEffect(() => {
        reloadButtons();
    }, []);

    async function wishlistGame() {
        try {
            await Api.wishlistGame(game.gameId);
            reloadButtons();
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    async function unwishlistGame() {
        try {
            await Api.unwishlistGame(game.gameId);
            reloadButtons();
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    async function markGameOwned() {
        try {
            await Api.markGameOwned(game.gameId);
            reloadButtons();
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    async function unmarkGameOwned() {
        try {
            await Api.unmarkGameOwned(game.gameId);
            reloadButtons();
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    return (
        <>
            <WishlistButton
                isCreator={isCreator}
                isLoggedIn={isLoggedIn}
                isWishlisted={isWishlisted}
                isOwned={isOwned}
                wishlistGame={wishlistGame}
                unwishlistGame={unwishlistGame} />

            <OwnedButton
                isCreator={isCreator}
                isLoggedIn={isLoggedIn}
                isOwned={isOwned}
                markGameOwned={markGameOwned}
                unmarkGameOwned={unmarkGameOwned} />
        </>
    );
}

export default function Game() {
    const params = useParams();
    const gameId = Number(params.id!);

    const { showSnackMessage } = useSnackbar();
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
            } catch (error: any) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                showSnackMessage(statusText, "error");
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
            } catch (error: any) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                showSnackMessage(statusText, "error");
                console.log(error);
            }
        };

        fetchSimilarGames();
    }, [gameId, allGenres, allPlatforms, game])

    async function fetchReviews() {
        if (!game) return;
        const reviews = await Api.getReviews(game.gameId);
        setReviews(reviews);
    }

    // Fetch Reviews
    useEffect(() => {
        fetchReviews();
    }, [game]);

    if (isNaN(gameId))
        return <pre>Invalid game ID: {params.id}</pre>

    if (!game || !allPlatforms || !allGenres)
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
                height: "6em" // why is this needed???
            }}>
                <img style={{ ...imageStyle }}
                    src={Api.getGameImage(gameId)} alt=""
                />

                <WishlistOwnedButtons
                    game={game}
                    allGenres={allGenres}
                    allPlatforms={allPlatforms} />
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
                    Released on <strong>{game.creationDate}</strong> by <strong>{game.creatorName()}</strong>
                </p>

                <p>
                    {game.description}
                </p>

                <p>
                    <strong>Platforms:</strong> {game.getPlatforms()}
                </p>

                <p>
                    <strong>Genre:</strong> {game.getGenreName()}
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
                <ReviewsSection fetchReviews={fetchReviews} game={game} reviews={reviews} />
            }

        </div>
    );
}
