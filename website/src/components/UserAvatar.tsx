import { Avatar, AvatarOwnProps } from "@mui/material";
import { Api, User } from "../services/api.service";

export default function UserAvatar(props: {
    user: User,
    size: number
    variant?: AvatarOwnProps["variant"]
}) {
    const { user, size, variant } = props;
    return (
        <Avatar
            alt={user.fullName()}
            src={Api.getUserImage(user.userId)}
            variant={variant ?? "circular"}
            sx={{
                width: size,
                height: size,
                fontSize: size / 2
            }}
        >
            {user.initials()}
        </Avatar>
    );
}