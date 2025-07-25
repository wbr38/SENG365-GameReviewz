import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function LogOut() {

    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    useEffect(() => {
        setAuth({
            token: null,
            userId: null
        });
        navigate("/");
    }, []);

    return (
        <h1>Logging out...</h1>
    );
}