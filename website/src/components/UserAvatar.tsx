import { Avatar, AvatarOwnProps } from "@mui/material";
import { Api, User } from "../services/api.service";

/*
UserAvatar can be defined by passing in a User object
or alternatively by defining a custom URL to use
*/

export default function UserAvatar(props: {
    size: number,
    user: User, 
    variant?: AvatarOwnProps["variant"],
    imageVersion?: number,
}): any;
export default function UserAvatar(props: {
    size: number,
    src: string,
    variant?: AvatarOwnProps["variant"],
    imageVersion?: number,
}): any;
export default function UserAvatar(props: {
    size: number,
    user?: User,
    src?: string,
    variant?: AvatarOwnProps["variant"],
    imageVersion?: number,
}) {
    let { user, size, src, variant, imageVersion } = props;

    imageVersion ??= 0;
    const srcUrl = (user ? Api.getUserImage(user.userId) : src) + `?v=${imageVersion}`;

    return (
        <Avatar
            alt={user && user.fullName()}
            src={srcUrl}
            variant={variant ?? "rounded"}
            sx={{
                width: size,
                height: size,
                fontSize: size / 2,
                margin: "auto"
            }}
        >
            {user && user.initials()}
        </Avatar>
    );
}