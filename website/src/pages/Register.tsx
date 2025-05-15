import { Typography, Box, FormControl, TextField, Button, Stack, Card, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { Api } from "../services/api.service";

function joinErrorMessages(errorMsgs: string[]) {
    // https://stackoverflow.com/a/67264565
    return (
        <>
            {errorMsgs.map(x => (
                <>{x} <br /></>
            ))}
        </>
    )
}

export default function Register() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // TODO: Remove after testing
    // useEffect(() => {
    //     setFirstName("Steve");
    //     setLastName("Steve");
    //     setEmail("steve.jobs@apple.com");
    //     setPassword("ddddddddddddddddddddddddddd");
    // }, []);

    const [firstNameErrorMsg, setFirstNameErrorMsg] = useState<string[]>([]);
    const [lastNameErrorMsg, setLastNameErrorMsg] = useState<string[]>([]);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string[]>([]);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string[]>([]);

    const [snackOpen, setSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackOpen(false);
    };

    function parseRegisterError(error: any) {
        const errorMap: { [prefix: string]: typeof setFirstNameErrorMsg } = {
            "data/firstName": setFirstNameErrorMsg,
            "data/lastName": setLastNameErrorMsg,
            "data/email": setEmailErrorMsg,
            "data/password": setPasswordErrorMsg
        };

        // Clear previous messages
        for (const setter of Object.values(errorMap))
            setter([]);

        const statusText = error.response.statusText as string;
        const splitMsgs = statusText
            .split("Bad Request: ")[1] // remove Bad Request: 
            ?.split(", ");

        const errorMessages: { [key: string]: string[] } = {};
        for (const msg of splitMsgs) {
            const match = msg.match(/(data\/\w+)\s(.+)/);
            if (!match) continue; // TODO: Snackbar as we failed to parse
            const [_, key, message] = match;
            if (!errorMessages[key])
                errorMessages[key] = [];

            errorMessages[key].push(message);
        }

        for (const [key, setter] of Object.entries(errorMap)) {
            if (errorMessages[key])
                setter(errorMessages[key]);
        }
    }

    async function tryRegister() {
        try {
            const { userId } = await Api.register({ firstName, lastName, password, email });

            // TODO: With account registered, try to log in
            // Need to use zustand to store auth
            // Should api.service.ts handle login completely? or just the request
            // maybe do everything and if we need to we can abstract it out later
            console.log(userId);
        } catch (error: any) {

            try {
                parseRegisterError(error);
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
                        Register
                    </Typography>

                    {/* Forms */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5em"
                        }}
                    >
                        {/* First Name */}
                        <FormControl>
                            <TextField
                                placeholder="First Name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                error={firstNameErrorMsg.length > 0}
                                helperText={joinErrorMessages(firstNameErrorMsg)}
                                color={!!firstNameErrorMsg ? "error" : "primary"}
                            />
                        </FormControl>

                        {/* Last Name */}
                        <FormControl>
                            <TextField
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                error={lastNameErrorMsg.length > 0}
                                helperText={joinErrorMessages(lastNameErrorMsg)}
                                color={!!lastNameErrorMsg ? "error" : "primary"}
                            />
                        </FormControl>

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
                            onClick={tryRegister}
                        >
                            Register
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