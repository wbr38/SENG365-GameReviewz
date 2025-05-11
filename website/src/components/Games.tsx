import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, CardMedia, Grid, Stack, Typography } from "@mui/material";
import { Suspense, use } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Api, Game } from "../services/api.service";
import * as S from "../styles/Game.styles";

function GameCards(props: { gamesPromise: Promise<Game[]> }) {
    const games = use(props.gamesPromise);

    return (
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
    )
}

export default function Games() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("search");

    return (
        <div>
            <Suspense key={query} fallback={<p>Loading...</p>}>
                <GameCards gamesPromise={Api.getGames(query)} />
            </Suspense>
        </div>
    );
};