import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Rating, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { GamesList } from "../../components/GamesList";
import { useSnackbar } from "../../components/SnackBar";
import { Api, GameInfo, GameList, Genre, Platform } from "../../services/api.service";
import { useAuthStore } from "../../store/auth-store";

function EditModal(props: {
    gameList: GameList | null
    isOpen: boolean
    closeModal: () => void,
    refresh: () => void,
}) {

    const { gameList, isOpen, refresh, closeModal } = props;
    const { showSnackMessage } = useSnackbar();

    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [genre, setGenre] = useState<string | null>(null);
    const [platforms, setPlatforms] = useState<string[] | null>(null);
    const [price, setPrice] = useState<number | null>(null);

    const [game, setGame] = useState<GameInfo | null>(null);
    const updateSelectedPlatforms = (value: string | string[]) => {
        if (!allPlatforms) return;

        if (typeof value === "string") {
            const names = value.split(",");
            return setPlatforms(names);
        }

        setPlatforms(value);
    };

    // Fetch allGenres and allPlatforms once, as it probably won't change between requests
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
            } catch (error: any) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                showSnackMessage(statusText, "error");
                console.log("Error fetching genres and platforms:", error);
            }
        }

        // Only fetch once
        if (!allGenres || !allPlatforms)
            fetchGenresAndPlatforms();
    }, []); // empty dependency array to only call once on page load

    useEffect(() => {
        async function fetchGameInfo() {
            if (!gameList || !allGenres || !allPlatforms)
                return;

            const game = await Api.getGameInfo(gameList.gameId, allGenres, allPlatforms);
            setGame(game);

            setTitle(game.title);
            setDescription(game.description);
            const genre = allGenres.filter((x) => x.genreId === game.genreId);
            setGenre(genre[0].name);
            const platforms = allPlatforms
                .filter((x) => game.platformIds.includes(x.platformId))
                .map(x => x.name);
            setPlatforms(platforms);
            setPrice(game.price / 100);
        }
        fetchGameInfo();
    }, [gameList]);

    async function tryEditGame() {
        try {
            if (!game
                || allPlatforms == null
                || allGenres == null
                || genre == null
                || platforms == null
                || price == null
                || title == null
                || description == null
            )
                return;

            await Api.editGame(game.gameId, {
                title,
                description,
                genreId: allGenres.filter(x => x.name === genre)[0].genreId,
                platformIds: allPlatforms.filter(x => platforms.includes(x.name)).map(x => x.platformId),
                price
            });

            closeModal();
            setGame(null);
            showSnackMessage("Game edited!", "success");
            refresh();
        } catch (error: any) {
            // TODO: parse as ajx and use hints???
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    if (!game || !allPlatforms || !allGenres || !genre || !platforms || price == null)
        return <></>;


    return (
        <Dialog
            open={isOpen}
            onClose={closeModal}
        >
            <DialogTitle>
                Edit Game: {game.title}
            </DialogTitle>

            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1em",
                width: "50vw"
            }}>
                <h2 style={{ margin: 0 }}>title</h2>

                {/*  Title */}
                <TextField
                    label="Title"
                    rows={1}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                {/* Description */}
                <TextField
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                {/* Genre */}
                <FormControl size="small">
                    <InputLabel>Genre</InputLabel>
                    <Select
                        value={genre}
                        onChange={(event) => setGenre(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => genre}
                    >
                        {allGenres?.map((g) => (
                            <MenuItem key={g.genreId} value={g.name}>
                                <Checkbox checked={genre === g.name} />
                                <ListItemText primary={g.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Platforms */}
                <FormControl size="small">
                    <InputLabel>Platforms</InputLabel>
                    <Select
                        multiple
                        value={platforms}
                        onChange={(event) => updateSelectedPlatforms(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => platforms.join(", ")}
                    >
                        {allPlatforms?.map((p) => (
                            <MenuItem key={p.platformId} value={p.name}>
                                <Checkbox checked={platforms?.includes(p.name)} />
                                <ListItemText primary={p.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Price */}
                <TextField
                    type="number"
                    label="Max Price"
                    size="small"
                    value={price.toString()}
                    onChange={(event) => {
                        if (event.target.value === "")
                            return setPrice(0.0);

                        const num = parseFloat(event.target.value);
                        console.log(event.target.value, num);
                        if (num <= 0)
                            return setPrice(0.0);

                        if (!isNaN(num))
                            return setPrice(Math.round(num * 100) / 100); // Round to 2 decimal places
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
            </DialogContent>

            <DialogActions>
                <Button onClick={closeModal}>Cancel</Button>
                <Button onClick={tryEditGame} autoFocus>
                    Edit Game
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DeleteModal(props: {
    game: GameList | null
    isOpen: boolean
    closeModal: () => void,
    refresh: () => void,
}) {

    const { game, isOpen, refresh, closeModal } = props;
    const { showSnackMessage } = useSnackbar();

    const [hasReviews, setHasReviews] = useState<boolean | null>(null);
    useEffect(() => {
        async function fetchReviews() {
            if (!game) return;

            try {
                const reviews = await Api.getReviews(game.gameId);
                setHasReviews(reviews.length > 0);
            } catch (error: any) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                showSnackMessage(statusText, "error");
                console.log(error);
            }
        }
        fetchReviews();
    }, [game]);

    async function tryDeleteGame() {
        try {
            if (!game) return;
            await Api.deleteGame(game.gameId);
            closeModal();
            showSnackMessage("Game deleted!", "success");
            refresh();
        } catch (error: any) {
            // TODO: Games that have been wishlisted can't be deleted (error from ref api impl)
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log("Error fetching genres and platforms:", error);
        }
        return;
    }

    if (!game)
        return <></>;

    if (hasReviews)
        return (
            <Dialog
                open={isOpen}
                onClose={closeModal}
            >
                <DialogTitle>
                    Delete Game: {game.title}
                </DialogTitle>

                <DialogContent sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                    width: "50vw"
                }}>
                    <h3 style={{ margin: 0 }}>This game cannot be deleted as it has been reviewed.</h3>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeModal}>Exit</Button>
                </DialogActions>
            </Dialog>
        );

    return (
        <Dialog
            open={isOpen}
            onClose={closeModal}
        >
            <DialogTitle>
                Delete Game: {game.title}
            </DialogTitle>

            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1em",
                width: "50vw"
            }}>
                <h3 style={{ margin: 0 }}>Are you sure you want to delete this game?</h3>
            </DialogContent>

            <DialogActions>
                <Button onClick={closeModal}>Cancel</Button>
                <Button color="error" onClick={tryDeleteGame} autoFocus>
                    Delete Game
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function CreatedGames() {
    const authState = useAuthStore((state) => state.auth);
    const userId = authState.userId ?? undefined;

    // To force rerender after edit/delete
    const [refreshCount, setRefreshCount] = useState(0);
    const refresh = () => setRefreshCount(prev => prev + 1);

    // Edit modal
    const [gameToEdit, setGameToEdit] = useState<GameList | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const openEditModal = () => setEditModalOpen(true);
    const closeEditModal = () => setEditModalOpen(false);

    // Delete modal
    const [gameToDelete, setGameToDelete] = useState<GameList | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const openDeleteModal = () => setDeleteModalOpen(true);
    const closeDeleteModal = () => setDeleteModalOpen(false);

    return (
        <div style={{
            margin: "0 auto"
        }}>
            <h1>Created Games</h1>
            <GamesList
                key={refreshCount}
                creatorId={userId}
                footer={
                    (game: GameList) => {
                        return <div style={{
                            display: "flex",
                            justifyContent: "end",
                            gap: "1em"
                        }}>
                            {/* Edit button */}
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                style={{ margin: "1em 0 0 0" }}
                                color="warning"
                                onClick={() => {
                                    setGameToEdit(game);
                                    openEditModal();
                                }}
                            >
                                Edit
                            </Button>

                            {/* Delete button */}
                            {/* TODO */}
                            <Button
                                variant="outlined"
                                startIcon={<DeleteForeverIcon />}
                                style={{ margin: "1em 0 0 0" }}
                                color="error"
                                onClick={() => {
                                    setGameToDelete(game);
                                    openDeleteModal();
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    }
                }
            />

            <EditModal
                gameList={gameToEdit}
                isOpen={editModalOpen}
                refresh={refresh}
                closeModal={closeEditModal}
            />

            <DeleteModal
                game={gameToDelete}
                isOpen={deleteModalOpen}
                refresh={refresh}
                closeModal={closeDeleteModal}
            />
        </div>
    )
}