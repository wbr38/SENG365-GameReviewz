import { Alert, AlertProps, Snackbar } from "@mui/material";
import { ReactNode, useState, useContext, createContext } from "react";

export type SnackbarContextType = {
    showSnackMessage: (message: string, severity?: AlertProps["severity"]) => void;
    closeSnack: () => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<AlertProps["severity"]>("info");

    function showSnackMessage(msg: string, severity: typeof snackSeverity) {
        setSnackMessage(msg);
        setSnackSeverity(severity);
        setSnackOpen(true);
    }

    function handleSnackClose(event?: React.SyntheticEvent | Event, reason?: string) {
        console.log(reason)
        if (reason === "clickaway") {
            return;
        }
        setSnackOpen(false);
    }

    return (
        <SnackbarContext.Provider value={{
            showSnackMessage,
            closeSnack: () => setSnackOpen(false)
        }}>
            {children}
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

export function useSnackbar() {
    const context = useContext(SnackbarContext);
    if (!context)
        throw new Error("useSnackbar must be used within a SnackbarProvider");

    return context;
}