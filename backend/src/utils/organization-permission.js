export const rolePermissions = {
    owner: [
        "workspace:update",
        "workspace:delete",
        "member:read",
        "member:invite",
        "member:update",
        "member:remove",
        "ownership:transfer",
        "team:manage",
    ],
    admin: [
        "workspace:update",
        "member:read",
        "member:invite",
        "member:update",
        "member:remove",
        "team:manage",
    ],
    member: ["workspace:read", "member:read"],
};

export const roleHierarchy = {
    owner: 3,
    admin: 2,
    member: 1,
};

export const can = (role, permission) =>
    rolePermissions[role].includes(permission);
