import { Checkbox, FormControl, Grid, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Pagination, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Api, GameList, GameSortMethod, Genre, Platform } from "../services/api.service";
import GameCard from "../components/GameCard";

export default function Games() {
    const [searchParams, setSearchParams] = useSearchParams();
    const updateParam = (name: string, value: string) => {
        searchParams.set(name, value);
        setSearchParams(searchParams);
    }

    const search = searchParams.get("search") ?? undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const updatePage = (value: number) => updateParam("page", value.toString());

    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const updatePerPage = (value: number) => updateParam("perPage", value.toString());

    const [gamesCount, setGamesCount] = useState(0);
    const [games, setGames] = useState<GameList[]>([]);
    const [allGenres, setAllGenres] = useState<Genre[] | null>(null);
    const [allPlatforms, setAllPlatforms] = useState<Platform[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [maxPrice, setMaxPrice] = useState(0.0);

    const [gameSortMethod, setGameSortMethod] = useState(GameSortMethod.CREATED_ASC);
    const gameSortOptions: [GameSortMethod, string][] = [
        [GameSortMethod.ALPHABETICAL_ASC, "Alphabetical (Ascending)"],
        [GameSortMethod.ALPHABETICAL_DESC, "Alphabetical (Descending)"],
        [GameSortMethod.PRICE_ASC, "Price (Ascending)"],
        [GameSortMethod.PRICE_DESC, "Price (Descending)"],
        [GameSortMethod.CREATED_ASC, "Creation Date (Ascending)"],
        [GameSortMethod.CREATED_DESC, "Creation Date (Descending)"],
        [GameSortMethod.RATING_ASC, "Rating (Ascending)"],
        [GameSortMethod.RATING_DESC, "Rating (Descending)"],
    ];

    const SELECT_ALL = "__select_all__";
    const SELECT_NONE = "__select_none__";
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const updateSelectedGenres = (value: string | string[]) => {
        if (!allGenres) return;

        const names = typeof value === "string" ? value.split(",") : value;
        if (names.includes(SELECT_ALL))
            return setSelectedGenres(allGenres.map(x => x.name));

        if (names.includes(SELECT_NONE))
            return setSelectedGenres([]);

        setSelectedGenres(names);
    };

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const updateSelectedPlatforms = (value: string | string[]) => {
        if (!allPlatforms) return;

        const names = typeof value === "string" ? value.split(",") : value;
        if (names.includes(SELECT_ALL))
            return setSelectedPlatforms(allPlatforms.map(x => x.name));

        if (names.includes(SELECT_NONE))
            return setSelectedPlatforms([]);

        setSelectedPlatforms(names);
    };

    // Fetch allGenres and allPlatforms once, as it probably won't change between requests
    useEffect(() => {
        async function fetchGenresAndPlatforms() {
            try {
                const [genresResponse, platformsResponse] = await Promise.all([
                    Api.getGenres(),
                    Api.getPlatforms(),
                ]);
                setAllGenres(genresResponse);
                setAllPlatforms(platformsResponse);

                // By default all genres and all platforms selected
                setSelectedGenres(genresResponse.map(x => x.name));
                setSelectedPlatforms(platformsResponse.map(x => x.name));
            } catch (err) {
                console.log("Error fetching genres and platforms:", err);
            }
        }

        // Only fetch once
        if (!allGenres || !allPlatforms)
            fetchGenresAndPlatforms();
    }, []); // empty dependency array to only call once on page load

    // Fetch games
    useEffect(() => {
        async function fetchGames() {
            // Genres or platforms hasn't loaded yet
            if (!allGenres || !allPlatforms) return;

            try {
                setLoading(true);
                setGames([]);
                const startIndex = (page - 1) * perPage;

                const _selectedGenres = allGenres.filter(x => selectedGenres.includes(x.name));
                const _selectedPlatforms = allPlatforms.filter(x => selectedPlatforms.includes(x.name));
                const gamesResponse = await Api.getGames(
                    allGenres,
                    allPlatforms,
                    {
                        query: search,
                        startIndex,
                        count: perPage,
                        sortBy: gameSortMethod,
                        price: maxPrice,
                        genres: _selectedGenres,
                        platforms: _selectedPlatforms
                    }
                );

                setGamesCount(gamesResponse.count);
                setGames(gamesResponse.games);
                window.scrollTo(0, 0);
            } catch (err) {
                // TODO: mui snackbar
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        fetchGames();
    }, [search, page, perPage, gameSortMethod, maxPrice, selectedGenres, selectedPlatforms, allGenres, allPlatforms]);

    const numPages = Math.ceil(gamesCount / perPage);

    return (
        <div>
            <p>
                {loading ? "Loading..." : `${gamesCount} Games`}
            </p>

            {/* Sorting & Filters */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1em"
                }}
            >
                {/* Sort */}
                <FormControl sx={{ minWidth: 160, mr: "2em" }} size="small">
                    <InputLabel>Order By</InputLabel>
                    <Select
                        value={gameSortMethod}
                        onChange={(event) => setGameSortMethod(event.target.value)}
                        label="Order by"
                    >
                        {gameSortOptions.map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Genre */}
                <FormControl sx={{ minWidth: 160, mr: "2em", textAlign: "left" }} size="small">
                    <InputLabel>Genres</InputLabel>
                    <Select
                        multiple
                        value={selectedGenres}
                        onChange={(event) => updateSelectedGenres(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => "Genres"}
                    >
                        {/* Select All */}
                        <MenuItem value={SELECT_ALL}>
                            <ListItemText primary="Select All" />
                        </MenuItem>

                        {/* Select All */}
                        <MenuItem value={SELECT_NONE}>
                            <ListItemText primary="Select None" />
                        </MenuItem>

                        {/* Actual genres */}
                        {allGenres?.map((genre) => (
                            <MenuItem key={genre.genreId} value={genre.name}>
                                <Checkbox checked={selectedGenres.includes(genre.name)} />
                                <ListItemText primary={genre.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Platform */}
                <FormControl sx={{ minWidth: 160, mr: "2em", textAlign: "left" }} size="small">
                    <InputLabel>Platforms</InputLabel>
                    <Select
                        multiple
                        value={selectedPlatforms}
                        onChange={(event) => updateSelectedPlatforms(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => "Platforms"}
                    >
                        {/* Select All */}
                        <MenuItem value={SELECT_ALL}>
                            <ListItemText primary="Select All" />
                        </MenuItem>

                        {/* Select All */}
                        <MenuItem value={SELECT_NONE}>
                            <ListItemText primary="Select None" />
                        </MenuItem>

                        {/* Actual platforms */}
                        {allPlatforms?.map((platform) => (
                            <MenuItem key={platform.platformId} value={platform.name}>
                                <Checkbox checked={selectedPlatforms.includes(platform.name)} />
                                <ListItemText primary={platform.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Max Price */}
                <TextField
                    type="number"
                    label="Max Price"
                    size="small"
                    value={maxPrice.toString()}
                    onChange={(event) => {
                        if (event.target.value === "")
                            return setMaxPrice(0.0);

                        const num = parseFloat(event.target.value);
                        if (num <= 0)
                            return setMaxPrice(0.0);

                        if (!isNaN(num))
                            return setMaxPrice(Math.round(num * 100) / 100); // Round to 2 decimal places
                    }}
                    slotProps={{
                        htmlInput: {
                            step: 1.0,
                        },
                        input: {
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        },
                    }}
                />
            </div>

            <Grid container spacing={2} columns={4} justifyContent={"center"}>
                {games.map((game) =>
                    <GameCard key={game.gameId} game={game} />
                )}
            </Grid>

            {!loading && page === numPages && <p>No more games!</p>}

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
                    count={numPages}
                    page={page}
                    onChange={(event, value) => updatePage(value)}
                    variant="outlined"
                    shape="rounded"
                />
            </div>
        </div>
    );
};