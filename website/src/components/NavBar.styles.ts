import { alpha, styled } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { Link } from "react-router-dom";

// Container for the search input
export const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: 4,
    backgroundColor: alpha("#fff", 0.15),
    marginLeft: theme.spacing(1),
    width: "auto",
    "&:hover": {
        backgroundColor: alpha("#fff", 0.25),
    },
}));

// Icon wrapper inside the search
export const IconWrapper = styled("div")(({ theme }) => ({
    padding: "0 8px",
    height: "100%",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

// Custom styled InputBase
export const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    width: "100%",

    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        [theme.breakpoints.up("sm")]: {
            width: "12ch",
            "&:focus": {
                width: "20ch",
            }
        }
    }
}));

export const Title = styled(Link)(({ theme }) => ({
        ...theme.typography.h6,
        color: "inherit",
        display: "flex",
        fontFamily: "monospace",
        fontWeight: "700",
        letterSpacing: "0.1rem",
        marginRight: "auto",
        textDecoration: "none",
}));