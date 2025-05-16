import { Typography, Box, FormControl, TextField, Button, Stack, Card, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Api } from "../services/api.service";
import { useAuthStore } from "../store/auth-store";
import { useNavigate } from "react-router-dom";
import { joinErrorMessages, parseAjvErrors } from "../services/ajv.parser";

export default function LogIn() {

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailErrorMsg, setEmailErrorMsg] = useState<string[]>([]);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string[]>([]);

    // TODO: (10 Remove after testing
    useEffect(() => {
        setEmail("user@bruno.example");
        setPassword("password");
    }, []);

    const [snackOpen, setSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackOpen(false);
    };

    const ajvErrors: { [prefix: string]: typeof setEmailErrorMsg } = {
        "data/email": setEmailErrorMsg,
        "data/password": setPasswordErrorMsg
    };

    async function tryLogin() {
        try {
            const {userId, token} = await Api.login({email, password});
            setAuth({
                token,
                userId
            });
            navigate("/"); // go to home page
        } catch (error: any) {
            try {
                parseAjvErrors(error, ajvErrors);
            } catch (_) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                setSnackMessage(statusText);
                setSnackOpen(true)
                console.log(error);
            }
        }
    }

    return (
        <div>
            <Stack>
                <Card sx={{
                    padding: "3em",
                    width: "35em",
                    margin: "auto",
                    marginTop: "10vh"
                }}>
                    {/* Title */}
                    <Typography variant="h4" mb={"1em"}>
                        Log In
                    </Typography>

                    {/* Forms */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5em"
                        }}
                    >
                        {/* Email */}
                        <FormControl>
                            <TextField
                                placeholder="Email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                error={emailErrorMsg.length > 0}
                                helperText={joinErrorMessages(emailErrorMsg)}
                                color={!!emailErrorMsg ? "error" : "primary"}
                            />
                        </FormControl>

                        {/* Password */}
                        <FormControl>
                            <TextField
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                error={passwordErrorMsg.length > 0}
                                helperText={joinErrorMessages(passwordErrorMsg)}
                                color={!!passwordErrorMsg ? "error" : "primary"}
                            />
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            onClick={tryLogin}
                        >
                            Login
                        </Button>

                    </Box>
                </Card>
            </Stack>

            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity="error" sx={{
                    width: '100%'
                }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}