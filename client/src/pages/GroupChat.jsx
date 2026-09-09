import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { webSocketContext } from '../context/WebSocketContext';
import { UserContext } from '../context/userContext';
import { useParams } from 'react-router';

function GroupChat() {
    const [msgStorage, setMsgStorage] = useState([{
        type: '',
        sender:'',
        msg: ''
    }]);
    const [msg, setMsg] = useState('');

    const { username } = useParams();

    const { ws } = useContext(webSocketContext);
    const { user } = useContext(UserContext);
    const { id, grpName } = useParams();

    useEffect( () => {
        if(ws){
         ws.send(JSON.stringify({type:'findGroup' , groupId:id}));
        }
    }, [])
    


    const sendMsg = async (e) => {
        e.preventDefault();
        msgStorage.push({
            type: 'sender',
            msg: msg,
            sender:user.username
        });

        if (ws) {
            await ws.send(JSON.stringify({
                type: 'groupChat',
                senderName: user.username,
                senderId: user.userId,
                msg: msg
            }));
        }
        setMsg('');
        console.log(msgStorage);
    };

    if (ws) {
        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'grpMsg' && msg.senderId !== user.userId) {
                setMsgStorage(prev => [...prev, { type: 'receiver',msg: msg.msg,sender:msg.senderName }]);
            }
        };
    }


    return (
        <>
            <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
                <div className="main h-[90vh] w-[90%] md:w-2/4 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="header px-4 w-full h-[8vh] border-b flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                        <h1>{grpName}</h1>
                    </div>

                    {/* Messages */}
                    <div className="msg-box w-full h-[100%] flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                        {msgStorage.filter((_, key) => key !== 0).map((index, key) => (

                            <div key={key} className={`w-full flex ${index.type === 'sender' ? 'justify-start' : 'justify-end'}`}>
                                <div className="msg w-fit max-w-[70%] border rounded-lg p-2 bg-blue-100 shadow-sm">
                                    <h1 className="text-sm text-blue-700 font-semibold mb-1">{index.sender}</h1>
                                    <p className="text-gray-800">{index.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message input */}
                    <div className="send-msg-box w-full h-[8vh] border-t bg-white flex items-center px-4">
                        <form onSubmit={sendMsg} className="w-full flex gap-2 items-center">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                                value={msg}
                                onChange={(e) => {
                                    setMsg(e.target.value);
                                }}
                                placeholder="Type your message..."
                                required
                            />
                            <button
                                type="submit"
                                className=" cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition-all"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GroupChat;
