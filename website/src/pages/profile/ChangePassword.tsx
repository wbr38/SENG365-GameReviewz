import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, Card, FormControl, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useSnackbar } from "../../components/SnackBar";
import { joinErrorMessages, parseAjvErrors } from "../../services/ajv.parser";
import { Api } from "../../services/api.service";

export default function ChangePassword() {

    const { showSnackMessage, closeSnack } = useSnackbar();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [currentPasswordErrorMsg, setCurrentPasswordErrorMsg] = useState<string[]>([]);
    const [newPasswordErrorMsg, setNewPasswordErrorMsg] = useState<string[]>([]);

    const ajvErrors: { [prefix: string]: typeof setCurrentPasswordErrorMsg } = {
        "data/password": setNewPasswordErrorMsg,
        "data/currentPassword": setCurrentPasswordErrorMsg,
    };

    async function tryChangePassword() {
        try {
            await Api.changePassword(currentPassword, newPassword);

            // Show snack bar... clear password
            showSnackMessage("Password successfully changed", "success");
            setCurrentPassword("");
            setNewPassword("");
            setCurrentPasswordErrorMsg([]);
            setNewPasswordErrorMsg([]);
        } catch (error: any) {

            closeSnack();
            try {
                parseAjvErrors(error, ajvErrors, showSnackMessage);
            } catch (_) {
                const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
                if (statusText === "Incorrect currentPassword") {
                    setNewPasswordErrorMsg(["Incorrect currentPassword"]);
                    return;
                }

                showSnackMessage(statusText, "error");
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
        </div>
    )
}