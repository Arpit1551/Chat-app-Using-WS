import React, { useContext, useState} from 'react';
import { webSocketContext } from '../context/WebSocketContext';
import {Link, useNavigate} from "react-router"
import toast from 'react-hot-toast';
import Cookie from 'js-cookie';

function SignUp() {
    const [userName, setUsernName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { ws } = useContext(webSocketContext);
    const navigate = useNavigate();

    const registerUser = async (e) => {
        e.preventDefault();
        if (password != confirmPassword) {
            return toast.error('Both password must be same!');
        };


        const userDetail = {
            userName: userName,
            email: email,
            password: password
        };

        try {
            if (ws) {
                await ws.send(JSON.stringify({ type: "register", value: userDetail }));
            } else {
                toast.error("WebSocket is not connected!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    if(ws){
        ws.onmessage = (data) => {
            const info = JSON.parse(data.data);
            if(info.type === "sameUserName"){
                toast.error("Username already taken !")
            }else if(info.type === "sameEmail"){
                toast.error("Email already in use try to login!")
            }else if(info.type === "token"){
                console.log(info.token);
                Cookie.set('token',info.token);
                navigate('/dashboard');
            }
          };
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white border border-gray-300 rounded-lg shadow-md w-[90%] max-w-sm p-6 flex flex-col items-center gap-6">
                <h1 className="text-2xl font-semibold text-gray-800">Sign Up</h1>

                <form action="#" className="w-full flex flex-col gap-5" onSubmit={registerUser}>
                    <input
                        type="text"
                        className="border-b border-gray-400 focus:border-blue-500 outline-none px-2 py-2"
                        placeholder="Username"
                        value={userName}
                        onChange={(e) => setUsernName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="border-b border-gray-400 focus:border-blue-500 outline-none px-2 py-2"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="border-b border-gray-400 focus:border-blue-500 outline-none px-2 py-2"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="border-b border-gray-400 focus:border-blue-500 outline-none px-2 py-2"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition w-[10.5vw] cursor-pointer"
                        >
                            Submit
                        </button>
                        <Link to='/login'>
                            <button
                                type="button"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-full transition w-[10.5vw] cursor-pointer"
                            >
                                Login
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;


