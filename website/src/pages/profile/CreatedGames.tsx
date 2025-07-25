import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Rating, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { GamesList } from "../../components/GamesList";
import { useSnackbar } from "../../components/SnackBar";
import UserAvatar from "../../components/UserAvatar";
import { joinErrorMessages, parseAjvErrors } from "../../services/ajv.parser";
import { Api, GameInfo, GameList, Genre, Platform } from "../../services/api.service";
import { useAuthStore } from "../../store/auth-store";

function CreateModal(props: {
    isOpen: boolean
    closeModal: () => void,
    refresh: () => void,
}) {
    const { isOpen, refresh, closeModal } = props;
    const { showSnackMessage } = useSnackbar();

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [genre, setGenre] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [image, setImage] = useState<File | null>(null);
    const [platforms, setPlatforms] = useState<string[]>([]);

    const [titleErrorMsg, setTitleErrorMsg] = useState<string[]>([]);
    const [descriptionErrorMsg, setDescriptionErrorMsg] = useState<string[]>([]);
    const [genreErrorMsg, setGenreErrorMsg] = useState<string[]>([]);
    const [imageErrorMsg, setImageErrorMsg] = useState<string[]>([]);
    const [platformsErrorMsg, setPlatformsErrorMsg] = useState<string[]>([]);

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


    const ajvErrors: { [prefix: string]: typeof setTitleErrorMsg } = {
        "data/title": setTitleErrorMsg,
        "data/description": setDescriptionErrorMsg,
        // "data/genreId": setGenreErrorMsg, // data must have required property 'genreId' 
        "data/platformIds": setPlatformsErrorMsg,
    };
    async function tryCreateGame() {
        try {
            if (!allGenres || !allPlatforms)
                return;

            if (!image)
                return setImageErrorMsg(["An image is required to create a game!"]);

            // Can't parse genreId as the error from ajv is in a slightly different format than the others
            if (genre == null)
                return setGenreErrorMsg(["An image is required to create a game!"]);

            const { gameId } = await Api.createGame({
                title,
                description,
                genreId: allGenres.filter(x => x.name === genre)[0]?.genreId,
                platformIds: allPlatforms.filter(x => platforms.includes(x.name)).map(x => x.platformId),
                price
            });

            await Api.setGameImage(gameId, image);
            closeModal();
            showSnackMessage("Game created!", "success");
            refresh();

            // reset state
            setTitle("");
            setDescription("");
            setGenre("");
            setPrice(0);
            setImage(null);
        } catch (error: any) {
            try {
                parseAjvErrors(error, ajvErrors, showSnackMessage);
            } catch (_) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                showSnackMessage(statusText, "error");
                console.log(error);
            }
        }
    }

    if (!allPlatforms || !allGenres)
        return <></>;

    return (
        <Dialog
            open={isOpen}
            onClose={closeModal}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Create Game
            </DialogTitle>

            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1em",
            }}>
                {/*  Title */}
                <TextField
                    label="Title"
                    rows={1}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    error={titleErrorMsg.length > 0}
                    helperText={joinErrorMessages(titleErrorMsg)}
                    color={!!titleErrorMsg ? "error" : "primary"}
                />

                {/* Description */}
                <TextField
                    label="Description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    error={descriptionErrorMsg.length > 0}
                    helperText={joinErrorMessages(descriptionErrorMsg)}
                    color={!!descriptionErrorMsg ? "error" : "primary"}
                />

                {/* Genre */}
                <FormControl
                    size="small"
                    error={genreErrorMsg.length > 0}
                >
                    <InputLabel>Genre</InputLabel>
                    <Select
                        value={genre}
                        onChange={(event) => setGenre(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => genre}
                        color={!!genreErrorMsg ? "error" : "primary"}
                    >
                        {allGenres.map((g) => (
                            <MenuItem key={g.genreId} value={g.name}>
                                <Checkbox checked={genre === g.name} />
                                <ListItemText primary={g.name} />
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{joinErrorMessages(genreErrorMsg)}</FormHelperText>
                </FormControl>

                {/* Platforms */}
                <FormControl
                    size="small"
                    error={platformsErrorMsg.length > 0}
                >
                    <InputLabel>Platforms</InputLabel>
                    <Select
                        multiple
                        value={platforms}
                        onChange={(event) => updateSelectedPlatforms(event.target.value)}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={() => platforms.join(", ")}
                        color={!!platformsErrorMsg ? "error" : "primary"}
                    >
                        {allPlatforms.map((p) => (
                            <MenuItem key={p.platformId} value={p.name}>
                                <Checkbox checked={platforms?.includes(p.name)} />
                                <ListItemText primary={p.name} />
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{joinErrorMessages(platformsErrorMsg)}</FormHelperText>
                </FormControl>

                {/* Price */}
                <TextField
                    type="number"
                    label="Price"
                    size="small"
                    value={price.toString()}
                    onChange={(event) => {
                        if (event.target.value === "")
                            return setPrice(0.0);

                        const num = parseFloat(event.target.value);
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
                // Price is default 0 and the html input shouldn't let invalid values be entered
                // error={priceErrorMsg.length > 0}
                // helperText={joinErrorMessages(priceErrorMsg)}
                // color={!!priceErrorMsg ? "error" : "primary"}
                />

                <FormControl
                    error={imageErrorMsg.length > 0}
                    color={!!genreErrorMsg ? "error" : "primary"}
                >
                    {/* Image Preview - not a useravatar but just easier to reuse */}
                    {image &&
                        <UserAvatar
                            size={200}
                            variant="rounded"
                            src={URL.createObjectURL(image)}
                        />
                    }

                    {/* Image Upload */}
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ marginTop: "1em" }}
                    >
                        Upload image
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif"
                            onChange={(event) => {
                                const file = event.target.files?.item(0);
                                if (file)
                                    setImage(file);
                            }}
                            style={{
                                width: 0,
                                height: 0
                            }}
                        />
                    </Button>

                    <FormHelperText>{joinErrorMessages(imageErrorMsg)}</FormHelperText>
                </FormControl>

            </DialogContent>

            <DialogActions>
                <Button onClick={closeModal}>Cancel</Button>
                <Button onClick={tryCreateGame}>
                    Create Game
                </Button>
            </DialogActions>
        </Dialog>
    );
}

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

            try {
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
            } catch (error) {
                showSnackMessage("Unkown error occured, check console.", "error");
                console.log(error);
            }
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
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Edit Game: {game.title}
            </DialogTitle>

            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1em",
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
                    label="Price"
                    size="small"
                    value={price.toString()}
                    onChange={(event) => {
                        if (event.target.value === "")
                            return setPrice(0.0);

                        const num = parseFloat(event.target.value);
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
    gameList: GameList | null
    isOpen: boolean
    closeModal: () => void,
    refresh: () => void,
}) {

    const { gameList, isOpen, refresh, closeModal } = props;
    const { showSnackMessage } = useSnackbar();
    const [game, setGame] = useState<GameInfo | null>(null);

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

            try {
                const game = await Api.getGameInfo(gameList.gameId, allGenres, allPlatforms);
                setGame(game);
            } catch (error) {
                showSnackMessage("Unkown error occured, check console.", "error");
                console.log(error);
            }
        }
        fetchGameInfo();
    }, [gameList]);

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
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log("Error fetching genres and platforms:", error);
        }
        return;
    }

    if (!game)
        return <></>;

    // Games that have been wishlisted can't be deleted (error from ref api impl)
    if (game.numberOfOwners > 0 || game.numberOfWishlists > 0)
        return (
            <Dialog
                open={isOpen}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Delete Game: {game.title}
                </DialogTitle>

                <DialogContent sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em"
                }}>
                    <h3 style={{ margin: 0 }}>This game cannot be deleted because it is currently owned or wishlisted by someone.</h3>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeModal}>Exit</Button>
                </DialogActions>
            </Dialog>
        );

    if (hasReviews)
        return (
            <Dialog
                open={isOpen}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Delete Game: {game.title}
                </DialogTitle>

                <DialogContent sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em"
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
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Delete Game: {game.title}
            </DialogTitle>

            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1em"
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

    // Create modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const openCreateModal = () => setCreateModalOpen(true);
    const closeCreateModal = () => setCreateModalOpen(false);

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

            <Button
                variant="outlined"
                startIcon={<EditIcon />}
                style={{ margin: "0 0 1em 0" }}
                color="success"
                onClick={openCreateModal}
            >
                Create new game
            </Button>

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
                gameList={gameToDelete}
                isOpen={deleteModalOpen}
                refresh={refresh}
                closeModal={closeDeleteModal}
            />

            <CreateModal
                isOpen={createModalOpen}
                refresh={refresh}
                closeModal={closeCreateModal}
            />
        </div>
    )
}