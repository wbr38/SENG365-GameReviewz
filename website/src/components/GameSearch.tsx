import { alpha, InputBase, styled } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

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


export default function GameSearch(props: {
    debounceMs?: number,
    style?: React.CSSProperties
}) {
    const { debounceMs, style } = props;
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState<string | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const SEARCH_DEBOUNCE_MS = debounceMs ?? 300;

    useEffect(() => {
        if (searchText == null)
            return;

        if (searchTimeout)
            clearTimeout(searchTimeout);

        if (SEARCH_DEBOUNCE_MS != -1) {
            const newTimeout = setTimeout(() => {
                navigate(`/games?search=${encodeURIComponent(searchText)}`);
            }, SEARCH_DEBOUNCE_MS);
            setSearchTimeout(newTimeout);
        }

    }, [searchText]);

    function handleSearch(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Enter")
            return;

        const query = event.currentTarget.value;
        navigate(`/games?search=${encodeURIComponent(query)}`);
    }


    return (
        <Search style={style}>
            <IconWrapper>
                <SearchIcon />
            </IconWrapper>
            <StyledInputBase
                placeholder="Search"
                value={searchText ?? ""}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={handleSearch}
            />
        </Search>
    );
}