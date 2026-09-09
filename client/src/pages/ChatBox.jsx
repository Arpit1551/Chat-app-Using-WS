import React, { useCallback, useState } from 'react';
import { useContext } from 'react';
import { webSocketContext } from '../context/WebSocketContext';
import { UserContext } from '../context/userContext';
import {useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';

function ChatBox() {
  const [msgStorage, setMsgStorage] = useState([{
    type: '',
    msg: ''
  }]);
  const [msg, setMsg] = useState('');

  const { username } = useParams();

  const { ws } = useContext(webSocketContext);
  const { user } = useContext(UserContext);
  const { socketId } = useParams();
  localStorage.setItem('sendTo',socketId);
  localStorage.setItem('friend',username);

  const navigate = useNavigate();

  const sendMsg = async (e) => {
    e.preventDefault();
    msgStorage.push({
      type: 'sender',
      msg: msg
    });
    // setMsgStorage(prev =>([...prev,{type:'sender' , msg:msg}]));

    if (ws) {
      await ws.send(JSON.stringify({
        type: 'singleChat',
        id: socketId,
        msg: msg
      }));
    }
    setMsg('');
  };

  if (ws) {
    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'singleChat' && socketId === msg.clientId) {
        setMsgStorage(prev => [
          ...prev,
          { type: 'receiver', msg: msg.msg }
        ]);
      } else if(msg.type === 'incomingCall' && socketId === msg.senderId){
        navigate(`/videoChat/${msg.roomId}`,{
          state:{senderId: msg.senderId}
        });

      }
    };
  }

  const startingVideoChat = useCallback(async () => {
    const roomId = Math.floor(1000 + Math.random() * 9000);
    try {
      if (ws) {
        await ws.send(JSON.stringify({ type: 'makingCall', roomId: roomId, socketId: socketId}));
      }
    } catch (error) {
      return toast.error("Unable to make a call right now !");
    }
    return navigate(`/videoChat/${roomId}`)
  }, []);


  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        <div className="main h-[90vh] w-[90%] md:w-2/4 bg-white shadow-lg rounded-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="header px-4 w-full h-[8vh] border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
            <h1>{username}</h1>

            <button className='px-2 cursor-pointer text-white bg-black rounded-full' onClick={startingVideoChat}>V</button>

          </div>

          {/* Messages */}
          <div className="msg-box w-full h-[100%] flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
            {msgStorage.filter((_, key) => key !== 0).map((index, key) => (

              <div key={key} className={`w-full flex ${index.type === 'sender' ? 'justify-start' : 'justify-end'}`}>
                <div className="msg w-fit max-w-[70%] border rounded-lg p-2 bg-blue-100 shadow-sm">
                  <h1 className="text-sm text-blue-700 font-semibold mb-1">{index.type === "sender" ? user.username : username}</h1>
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

export default ChatBox;
