import { Box, Button, Card, FormControl, Link, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "../components/SnackBar";
import { joinErrorMessages, parseAjvErrors } from "../services/ajv.parser";
import { Api } from "../services/api.service";
import { useAuthStore } from "../store/auth-store";

export default function LogIn() {

    const { showSnackMessage } = useSnackbar();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailErrorMsg, setEmailErrorMsg] = useState<string[]>([]);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string[]>([]);

    const ajvErrors: { [prefix: string]: typeof setEmailErrorMsg } = {
        "data/email": setEmailErrorMsg,
        "data/password": setPasswordErrorMsg
    };

    async function tryLogin() {
        try {
            const { userId, token } = await Api.login({ email, password });
            setAuth({
                token,
                userId
            });
            navigate("/"); // go to home page
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

    // Redirect to home page if already logged in
    useEffect(() => {
        const { auth } = useAuthStore.getState();
        const isLoggedIn = auth.token !== null && auth.userId !== null;
        if (isLoggedIn)
            navigate("/");
    }, []);

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

                        <Typography>
                            Don't have an account? <Link component={RouterLink} to="/register">Register</Link>
                        </Typography>
                    </Box>
                </Card>
            </Stack>
        </div>
    )
}