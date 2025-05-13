import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, CardMedia, FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Api, Game, GameSortMethod } from "../services/api.service";
import * as S from "../styles/Game.styles";

function GameCards(props: { games: Game[], count: number }) {
    const { games } = props;

    return (
        <div>
            <Grid container spacing={2} columns={4} justifyContent={"center"}>
                {games.map((game) =>
                    <S.SyledCard key={game.gameId} variant="outlined" >

                        {/* Hero Image */}
                        <CardMedia
                            component="img"
                            alt={game.title}
                            image={Api.getGameImage(game)}
                            sx={{
                                aspectRatio: "1 / 1",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                            }}
                        />

                        {/* Game Info Content */}
                        <S.SyledCardContent style={{ textAlign: "left" }}>

                            {/* Title */}
                            <Typography gutterBottom variant="h6" component="div" textAlign="left">
                                {game.title}
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: "#1e1e1e",
                                    color: "#fff",
                                    padding: 2,
                                    borderRadius: "4px",
                                    width: "100%",
                                }}
                            >
                                <Stack spacing={1}>
                                    {/* Details */}
                                    <S.GameDetail name="Creation Date" value={game.creationDate()} />
                                    <S.GameDetail name="Genre" value={game.getGenreName()} />
                                    <S.GameDetail name="Creator" value={game.creatorName()} />
                                    <S.GameDetail name="Platforms" value={"Mobile, Nintendo Switch, PC, Playstation 5"} />

                                    {/* Price & Button */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: 2,
                                            p: 1,
                                            borderTop: "1px solid #444",
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="bold">
                                            {game.priceStr()}
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            sx={{ minWidth: 0, px: 2, py: 0.5 }}
                                            component={Link}
                                            to={`/games/${game.gameId}`}
                                        >
                                            <ArrowForwardIcon />
                                        </Button>
                                    </Box>
                                </Stack>
                            </Box>
                        </S.SyledCardContent>
                    </S.SyledCard>
                )}
            </Grid>

        </div>
    )
}

export default function Games() {
    const [searchParams, setSearchParams] = useSearchParams();
    const updateParam = (name: string, value: string) => {
        searchParams.set(name, value);
        setSearchParams(searchParams);
    }

    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const updatePage = (value: number) => updateParam("page", value.toString());

    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const updatePerPage = (value: number) => updateParam("perPage", value.toString());

    const [gamesCount, setGamesCount] = useState(0);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [gameSortMethod, setGameSortMethod] = useState(GameSortMethod.CREATED_ASC);

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const startIndex = (page - 1) * perPage;
                const [gamesResponse, genresResponse, platformsResponse] = await Promise.all([
                    Api.getGames(search, startIndex, perPage, gameSortMethod),
                    Api.getGenres(),
                    Api.getPlatforms()
                ]);

                // Construct Game instances with mapping
                const genreMap = new Map(genresResponse.map(x => [x.genreId, x.name]));
                const platformMap = new Map(platformsResponse.map(x => [x.platformId, x.name]));
                const games = gamesResponse.games.map(game => new Game(game, genreMap, platformMap));

                setGamesCount(gamesResponse.count);
                setGames(games);
                window.scrollTo(0, 0);
            } catch (err) {
                // TODO: mui snackbar
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, [search, page, perPage, gameSortMethod]);

    return (
        <div>

            {loading && <p>Loading...</p>}

            {/* Sorting */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1em"
                }}
            >
                <FormControl sx={{ minWidth: 160, mr: "2em" }} size="small">
                    <InputLabel>Order By</InputLabel>
                    <Select
                        value={gameSortMethod}
                        onChange={(event) => setGameSortMethod(event.target.value)}
                        label="Order by"
                    >
                        <MenuItem value={GameSortMethod.ALPHABETICAL_ASC}>Alphabetical (Ascending)</MenuItem>
                        <MenuItem value={GameSortMethod.ALPHABETICAL_DESC}>Alphabetical (Descending)</MenuItem>
                        <MenuItem value={GameSortMethod.PRICE_ASC}>Price (Ascending)</MenuItem>
                        <MenuItem value={GameSortMethod.PRICE_DESC}>Price (Descending)</MenuItem>
                        <MenuItem value={GameSortMethod.CREATED_ASC}>Created (Ascending)</MenuItem>
                        <MenuItem value={GameSortMethod.CREATED_DESC}>Created (Descending)</MenuItem>
                        <MenuItem value={GameSortMethod.RATING_ASC}>Rating (Ascending)</MenuItem>
                        <MenuItem value={GameSortMethod.RATING_DESC}>Rating (Descending)</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {<GameCards games={games} count={gamesCount} />}

            {/* Pagination Menu */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "2em"
                }}
            >
                <FormControl sx={{ minWidth: 160, mr: "2em" }} size="small">
                    <InputLabel>Items per page</InputLabel>
                    <Select
                        value={perPage}
                        onChange={(event) => updatePerPage(Number(event.target.value))}
                        label="Items per page"
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={6}>6</MenuItem>
                        <MenuItem value={7}>7</MenuItem>
                        <MenuItem value={8}>8</MenuItem>
                        <MenuItem value={9}>9</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                    </Select>
                </FormControl>

                <Pagination
                    count={Math.ceil(gamesCount / perPage)}
                    page={page}
                    onChange={(event, value) => updatePage(value)}
                    variant="outlined"
                    shape="rounded"
                />
            </div>
        </div>
    );
};