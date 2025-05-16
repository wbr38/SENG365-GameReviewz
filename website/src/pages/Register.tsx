import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Alert, Avatar, Box, Button, Card, FormControl, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinErrorMessages, parseAjvErrors } from "../services/ajv.parser";
import { Api } from "../services/api.service";
import { useAuthStore } from "../store/auth-store";

export default function Register() {

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // Redirect to home page if already logged in
    useEffect(() => {
        const { auth } = useAuthStore.getState();
        const isLoggedIn = auth.token !== null && auth.userId !== null;
        if (isLoggedIn)
            navigate("/");
    }, []);

    // TODO: Remove after testing
    // useEffect(() => {
    //     setFirstName("Ads");
    //     setLastName("Ads");
    //     setEmail("a@b.com");
    //     setPassword("ACoolPassword");
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

    const ajvErrors: { [prefix: string]: typeof setFirstNameErrorMsg } = {
        "data/firstName": setFirstNameErrorMsg,
        "data/lastName": setLastNameErrorMsg,
        "data/email": setEmailErrorMsg,
        "data/password": setPasswordErrorMsg
    };

    async function tryRegister() {
        try {
            const { userId } = await Api.register({ firstName, lastName, password, email });

            // Try login
            const loginResponse = await Api.login({ email, password });
            setAuth({
                token: loginResponse.token,
                userId
            });

            // Upload profile picture
            if (profileImage)
                await Api.setUserImage(profileImage);

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

                        {/* Profile Image Preview */}
                        {profileImage &&
                            <Avatar
                                alt="Profile Image Preview"
                                src={URL.createObjectURL(profileImage)}
                                variant="rounded"
                                sx={{
                                    width: "10em",
                                    height: "10em",
                                    margin: "0 auto"
                                }}
                            />
                        }

                        {/* Profile Image Upload */}
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload profile image
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/gif"
                                onChange={(event) => {
                                    const file = event.target.files?.item(0);
                                    if (file)
                                        setProfileImage(file);
                                }}
                                style={{
                                    width: 0,
                                    height: 0
                                }}
                            />
                        </Button>

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