import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { webSocketContext } from "../context/WebSocketContext";
import Cookie from 'js-cookie';
import { Navigate, useNavigate } from "react-router";

function UserAuth({ children }) {
    const { user, setUser } = useContext(UserContext);
    const { ws } = useContext(webSocketContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const token = Cookie.get('token');

    if (!token) {
        return (
            <navigate to="/" />
        )
    };
    useEffect(() => {
        try {
            if (ws) {
                ws.send(JSON.stringify({ type: 'UserAuth', token: token }));
            }

            if (ws) {
                ws.onmessage = async (info) => {
                    const data = await JSON.parse(info.data);
                    if (data.type === "Unautharised") {
                        <navigate to='/' />
                    }
                    else if (data.type === "latestUserInfo") {
                        await setUser({
                            userId: data.userInfo._id,
                            username: data.userInfo.username,
                            email: data.userInfo.email,
                            friends: data.userInfo.friends,
                            groups: data.userInfo.groups,
                            socketId: data.userInfo.socketId,
                            status: 'online'
                        });
                        setLoading(false);
                    }
                }
            }

        } catch (error) {
            throw error;
        }
    }, [ws, token, navigate]);

    if (loading) return <div>Loading...</div>;
    return children;
}

export default UserAuth 