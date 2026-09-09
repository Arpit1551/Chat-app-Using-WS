import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { webSocketContext } from '../context/WebSocketContext';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';


function Dashboard() {

    const { ws } = useContext(webSocketContext);
    const { user } = useContext(UserContext);
    const [count, setcount] = useState(0);
    const navigate = useNavigate();
    const [friend, setFriend] = useState("");

    const [selectedFriends, setSlectedFriends] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");


    useEffect(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "activeUsers" }));
        }
    }, [ws]);

    useEffect(() => {
        if (!ws) { return };
        ws.onmessage = (data) => {
            const info = JSON.parse(data.data);
            if (info.type === "activeUsers") {
                setcount(info.size);
            };
        }

    }, [ws]);

    const findFriend = (e) => {
        e.preventDefault();
        if (!ws) { return };
        ws.send(JSON.stringify({ type: "addFriend", username: friend, id: user.userId }));
    }

    const toggleSelectedFriends = (id) => {
        setSlectedFriends((prev) =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    }


    const createGroup = () => {
        if (!groupName) {
            return toast.error("Enter the group name!");
        }
        else if (selectedFriends.length < 2) {
            return toast.error("You need more friends to create a group!")
        }

        if (ws) {
            selectedFriends.push(user.userId);
            ws.send(JSON.stringify({
                type: "createGroup",
                name: groupName,
                members: selectedFriends,
                owner: user.userId
            }));
        }

        console.log(selectedFriends);
        setShowGroupModal(false);
        setGroupName("");
        setSlectedFriends([]);
    };

    return (
        <>

            <div className="w-full bg-white px-6 py-4 shadow-md flex justify-center items-center gap-6 border-b border-gray-300">
                <img
                    src="https://i.pinimg.com/736x/7b/db/c4/7bdbc48fcb0c9025266dc5c7f3d542b4.jpg"
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full shadow-md"
                />
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">{user.username}</h1>
                    <h1 className="text-lg text-gray-600">{user.email}</h1>
                    <h1 className="text-green-500 font-medium">Online</h1>
                </div>
            </div>


            <div className="h-[77vh] w-screen flex bg-gray-50">

                <div className="border-r h-full w-1/3 flex flex-col justify-center items-center gap-4 px-4 bg-white">
                    <h1 className="text-2xl font-semibold text-gray-800">Enter Global Chat</h1>
                    <h2>Users Online: {count}</h2>
                    <Link to='globalChat'>
                        <button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full transition duration-200">
                            Join
                        </button>
                    </Link>
                </div>


                <div className="border-r h-full w-1/3 flex flex-col items-center px-4 pt-4 bg-white overflow-y-auto">

                    <div className="w-full max-w-[90%] flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-semibold text-gray-800">Friends: {user.friends.length}</h1>
                        <form onSubmit={findFriend}>

                            <input
                                type="text"
                                className='border-b mr-2 outline-none px-2 border-gray-500'
                                required
                                value={friend}
                                onChange={(e) => { setFriend(e.target.value) }}
                            />

                            <button
                                type='submit'
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
                            >
                                Add Friend
                            </button>
                        </form>
                    </div>


                    <input
                        type="text"
                        placeholder="Search friends"
                        className="border border-gray-300 outline-none px-4 py-2 rounded-full w-full max-w-[90%] shadow-sm mb-4"
                    />

                    {user.friends.map((friend, key) => (
                        <div key={key} className="mt-2 flex flex-col gap-4 w-full items-center">
                            <div className="w-full max-w-[90%] h-[7vh] border rounded-2xl flex justify-between items-center px-6 py-2 bg-gray-100 hover:shadow">
                                <div className="flex gap-3 items-center">
                                    <h1 className="text-lg font-medium text-gray-700">{friend.username}</h1>
                                    <h3 className="text-green-500 text-sm">{friend.status}</h3>
                                </div>
                                <button
                                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium transition"
                                    onClick={() => navigate(`/chat/${friend.username}/${friend._id}/${friend.socketId}`)}
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="h-full w-1/3 flex flex-col items-center px-4 pt-4 bg-white overflow-y-auto">
                    <div className="w-full max-w-[90%] flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-semibold text-gray-800">Groups: {user.groups.length}</h1>
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
                        >
                            + Create Group
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search"
                        className="border border-gray-300 outline-none px-4 py-2 rounded-full mt-4 w-full max-w-[90%] shadow-sm"
                    />
                    {
                        user.groups.map((group, i) => (
                            <div key={i} className="mt-6 flex flex-col gap-4 w-full items-center">
                                <div className="w-full max-w-[90%] h-[7vh] border rounded-2xl flex justify-between items-center px-6 py-2 bg-gray-100 hover:shadow">
                                    <div className="flex gap-3 items-center">
                                        <h1 className="text-lg font-medium text-gray-700">{group.name}</h1>
                                        <h3 className="text-green-500 text-sm">Online: {group.online}/{group.total}</h3>
                                    </div>
                                    <Link to={`/groupChat/${group.name}/${group._id}`}>
                                    <button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium transition">
                                        Enter
                                    </button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {showGroupModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-xl w-[30rem] shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group Name"
                                className="w-full border px-3 py-2 mb-4 rounded-md outline-none"
                            />
                            <div className="w-full max-w-[90%] mt-4">
                                {user?.friends?.map((f, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition rounded-xl shadow-sm px-4 py-3 mb-3"
                                    >
                                        {/* Friend Info */}
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-blue-500 rounded"
                                                checked={selectedFriends.includes(f._id)}
                                                onChange={() => (toggleSelectedFriends(f._id))}
                                            />

                                            <p className="text-gray-800 font-medium">{f.username}</p>
                                            <p className={`text-sm ${f.status === 'Online' ? 'text-green-500' : 'text-gray-500'}`}>
                                                {f.status}
                                            </p>

                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* <div className="max-h-40 overflow-y-auto mb-4">
                                {user.friends.map((f, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            className=''
                                            checked={selectedFriends.includes(f._id)}
                                            onChange={() => (toggleSelectedFriends(f._id))}
                                        />
                                        <label className="text-gray-800">{f.username}</label>
                                    </div>
                                ))}
                            </div> */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowGroupModal(false)}
                                    className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createGroup}
                                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}

export default Dashboard;
