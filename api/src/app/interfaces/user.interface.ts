// User entity as defined by the database
export interface DBUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    image_filename?: string;
    password: string;
    auth_token: string;
}

// User entity as defined by API requests/responses
export interface APIUser {
    // Only defined when user is viewing their own profile
    email?: string;
    firstName: string;
    lastName: string;
}