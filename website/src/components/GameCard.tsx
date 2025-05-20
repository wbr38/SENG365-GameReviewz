import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardContent, CardMedia, Stack, styled, Typography } from "@mui/material";
import { JSX } from "react";
import { Link } from "react-router-dom";
import { Api, GameList } from "../services/api.service";
import UserAvatar from "./UserAvatar";

export const SyledCard = styled(Card)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "20em",
    height: "100%",
    transition: "all 0.15s ease-in-out",
    "&:hover": {
        backgroundColor: "#0A0A0A",
        cursor: "pointer",
    },
}));

export const SyledCardContent = styled(CardContent)({
    display: "flex",
    flexDirection: "column",
    justifyContent: "left",
    gap: 4,
    padding: 16,
    flexGrow: 1,
    "&:last-child": {
        paddingBottom: 16,
    },
});

export function GameDetail(props: { name: string, children: React.ReactNode }) {
    const { name, children } = props;
    return (
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="gray">
                {name}
            </Typography>
            <div style={{ display: "flex", textAlign: "right", gap: "0.5ch" }}>
                {children}
            </div>
        </Stack>
    );
}

export default function GameCard(props: {
    game: GameList,
    footer?: JSX.Element
}) {

    const { game, footer } = props;
    return (
        <SyledCard key={game.gameId} variant="outlined" >

            {/* Hero Image */}
            <CardMedia
                component="img"
                alt={game.title}
                image={Api.getGameImage(game.gameId)}
                sx={{
                    aspectRatio: "1 / 1",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            />

            {/* Game Info Content */}
            <SyledCardContent style={{ textAlign: "left" }}>

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
                    {/* Details */}
                    <Stack spacing={1}>
                        <GameDetail name="Creation Date">{game.creationDate}</GameDetail>
                        <GameDetail name="Genre">{game.getGenreName()}</GameDetail>

                        <GameDetail name="Creator" >
                            <UserAvatar user={game.creator} size={18} />
                            {game.creatorName()}
                        </GameDetail>

                        <GameDetail name="Platforms">{game.getPlatforms()}</GameDetail>

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

                {!!footer && footer}
            </SyledCardContent>
        </SyledCard>
    );
} 