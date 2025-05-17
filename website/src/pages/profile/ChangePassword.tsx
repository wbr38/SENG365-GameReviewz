import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Alert, AlertProps, Box, Button, Card, FormControl, IconButton, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { joinErrorMessages, parseAjvErrors } from "../../services/ajv.parser";
import { Api } from "../../services/api.service";

export default function ChangePassword() {

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [currentPasswordErrorMsg, setCurrentPasswordErrorMsg] = useState<string[]>([]);
    const [newPasswordErrorMsg, setNewPasswordErrorMsg] = useState<string[]>([]);

    const [snackOpen, setSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const [snackSeverity, setSnackSeverity] = useState<AlertProps["severity"]>("error");
    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackOpen(false);
    };

    function showSnack(message: string, severity: typeof snackSeverity) {
        setSnackMessage(message);
        setSnackOpen(true);
        setSnackSeverity(severity);
    }

    const ajvErrors: { [prefix: string]: typeof setCurrentPasswordErrorMsg } = {
        "data/password": setNewPasswordErrorMsg,
        "data/currentPassword": setCurrentPasswordErrorMsg,
    };

    async function tryChangePassword() {
        try {
            await Api.changePassword(currentPassword, newPassword);

            // Show snack bar... clear password
            showSnack("Password successfully changed", "success");
            setCurrentPassword("");
            setNewPassword("");
            setCurrentPasswordErrorMsg([]);
            setNewPasswordErrorMsg([]);
        } catch (error: any) {

            setSnackOpen(false);
            try {
                parseAjvErrors(error, ajvErrors);
            } catch (_) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                if (statusText === "Incorrect currentPassword") {
                    setNewPasswordErrorMsg(["Incorrect currentPassword"]);
                    return;
                }

                showSnack(statusText, "error");
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
                }}>
                    {/* Title */}
                    <Typography variant="h4" mb={"1em"}>
                        Change Password
                    </Typography>

                    {/* Forms */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5em"
                        }}
                    >
                        {/* New Password */}
                        <FormControl>
                            <TextField
                                placeholder="New Password"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                error={newPasswordErrorMsg.length > 0}
                                helperText={joinErrorMessages(newPasswordErrorMsg)}
                                color={!!newPasswordErrorMsg ? "error" : "primary"}
                                slotProps={{
                                    input: {
                                        // Toggle Visibility
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowNewPassword((value) => !value)}
                                            >
                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    },
                                }}
                            />
                        </FormControl>

                        {/* Current Password */}
                        <FormControl>
                            <TextField
                                placeholder="Current Password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                error={currentPasswordErrorMsg.length > 0}
                                helperText={joinErrorMessages(currentPasswordErrorMsg)}
                                color={!!currentPasswordErrorMsg ? "error" : "primary"}
                                slotProps={{
                                    input: {
                                        // Toggle Visibility
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowCurrentPassword((value) => !value)}
                                            >
                                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    },
                                }}
                            />
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            onClick={tryChangePassword}
                        >
                            Change Password
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
                <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{
                    width: '100%'
                }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}