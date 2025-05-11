import { Card, CardContent, Stack, styled, Typography } from "@mui/material";

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

export function GameDetail(props: { name: string, value: string }) {
    const { name, value } = props;
    return (
        <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="gray">
                {name}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "right" }}>
                {value}
            </Typography>
        </Stack>
    );
}