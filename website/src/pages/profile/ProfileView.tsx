import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useSnackbar } from "../../components/SnackBar";
import UserAvatar from "../../components/UserAvatar";
import { joinErrorMessages, parseAjvErrors } from "../../services/ajv.parser";
import { Api, LoggedInUser } from "../../services/api.service";

export default function ProfileView() {

    const { showSnackMessage } = useSnackbar();
    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [imageVersion, setImageVersion] = useState(0); // to cause rerender of profile image
    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    async function fetchEditData() {
        try {
            const userResponse = await Api.getLoggedInUser();
            setUser(userResponse);
            setFirstName(userResponse.firstName);
            setLastName(userResponse.lastName);
            setEmail(userResponse.email);
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    function reloadEditData() {
        setIsEditing(false);
        setUser(null);
        fetchEditData();
    }

    // Set data on first load
    useEffect(() => {
        fetchEditData();
    }, []);

    const [firstNameErrorMsg, setFirstNameErrorMsg] = useState<string[]>([]);
    const [lastNameErrorMsg, setLastNameErrorMsg] = useState<string[]>([]);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string[]>([]);

    const ajvErrors: { [prefix: string]: typeof setFirstNameErrorMsg } = {
        "data/firstName": setFirstNameErrorMsg,
        "data/lastName": setLastNameErrorMsg,
        "data/email": setEmailErrorMsg,
    };

    async function tryChangeProfileImage(file: File) {
        try {
            await Api.setUserImage(file);
            showSnackMessage("Successfully updated profile image", "success");
            setImageVersion(prev => prev + 1);
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    async function tryRemoveProfileImage() {
        try {
            await Api.removeUserImage();
            showSnackMessage("Successfully removed profile image", "success");
            setImageVersion(prev => prev + 1);
        } catch (error: any) {
            const statusText = error?.response?.statusText ?? "Unkown error occured, check console.";
            showSnackMessage(statusText, "error");
            console.log(error);
        }
    }

    async function tryEditProfile() {
        try {
            let data: Parameters<typeof Api.editLoggedInUser>[0] = {};
            if (firstName && firstName !== user?.firstName)
                data.firstName = firstName;

            if (lastName && lastName !== user?.lastName)
                data.lastName = lastName;

            if (email && email !== user?.email)
                data.email = email;

            // no change made
            if (Object.keys(data).length === 0) {
                showSnackMessage("Please make some changes first", "warning");
                return;
            }

            await Api.editLoggedInUser(data);
            showSnackMessage("Successfully updated profile", "success");

            // Reload
            reloadEditData();
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

    if (!user)
        return <p>Loading...</p>;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "4em"
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1em"
            }}>
                <TextField
                    label="First Name"
                    disabled={!isEditing}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    error={firstNameErrorMsg.length > 0}
                    helperText={joinErrorMessages(firstNameErrorMsg)}
                    color={!!firstNameErrorMsg ? "error" : "primary"}
                />

                <TextField
                    label="Last Name"
                    disabled={!isEditing}
                    defaultValue={user.lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    error={lastNameErrorMsg.length > 0}
                    helperText={joinErrorMessages(lastNameErrorMsg)}
                    color={!!lastNameErrorMsg ? "error" : "primary"}
                />

                <TextField
                    label="Email"
                    disabled={!isEditing}
                    defaultValue={user.email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={emailErrorMsg.length > 0}
                    helperText={joinErrorMessages(emailErrorMsg)}
                    color={!!emailErrorMsg ? "error" : "primary"}
                />
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1em"
            }}>
                {/* Creator Name & Image (left) */}
                <div>
                    <UserAvatar imageVersion={imageVersion} size={200} variant="rounded" user={user} />
                    <p style={{ margin: 0 }}>Profile Image</p>
                </div>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={tryRemoveProfileImage}
                >
                    <DeleteForeverIcon sx={{ marginRight: "0.5ch" }} />
                    Remove Profile Image
                </Button>

                {/* Profile Image Upload */}
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                >
                    Upload New Profile Image
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/gif"
                        onChange={(event) => {
                            const file = event.target.files?.item(0);
                            if (file)
                                tryChangeProfileImage(file);
                        }}
                        style={{
                            width: 0,
                            height: 0
                        }}
                    />
                </Button>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "end",
                gap: "1em",
            }}>
                <Button
                    variant="outlined"
                    onClick={() => setIsEditing(prev => !prev)}
                >
                    {isEditing ? "Stop Editing" : "Edit"}
                    <EditIcon sx={{ marginLeft: "0.5ch" }} />
                </Button>

                <Button
                    variant="outlined"
                    onClick={tryEditProfile}
                >
                    Save
                    <SaveIcon sx={{ marginLeft: "0.5ch" }} />
                </Button>
            </div>
        </div>
    );
}