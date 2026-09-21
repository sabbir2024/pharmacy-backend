import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            status: user.status,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getTokenFromRequest(req) {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return auth.substring(7);
}

// সব auth চেক
export function requireAuth(req) {
    const token = getTokenFromRequest(req);
    if (!token) return { error: "No token", status: 401 };

    const payload = verifyToken(token);
    if (!payload) return { error: "Invalid token", status: 401 };

    return { user: payload };
}

// শুধু active user
export function requireActiveUser(req) {
    const result = requireAuth(req);
    if (result.error) return result;

    if (result.user.status !== "active") {
        return {
            error: `Your account is ${result.user.status}. Please wait for admin approval.`,
            status: 403,
            userStatus: result.user.status,
        };
    }

    return { user: result.user };
}

// শুধু admin
export function requireAdmin(req) {
    const result = requireAuth(req);
    if (result.error) return result;

    if (result.user.role !== "admin") {
        return { error: "Admin access required", status: 403 };
    }

    return { user: result.user };
}