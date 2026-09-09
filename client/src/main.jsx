import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WebSocketProvider } from './context/WebSocketContext.jsx'
import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from 'react-router';
import SignUp from './pages/signUp.jsx'
import Login from './pages/login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ChatBox from './pages/ChatBox.jsx'
import { UserContextProvider } from './context/userContext.jsx';
import UserAuth from './middleware/UserAuth.jsx';
import GlobalChat from './pages/GlobalChat.jsx';
import GroupChat from './pages/GroupChat.jsx';
import VideoPlayer from './pages/VideoPlayer.jsx';
import { PeerProvider } from './context/PeerContex.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignUp />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/dashboard",
    element: (
      <UserAuth>
        <Dashboard />
      </UserAuth>
    )
  },
  {
    path: "chat/:username/:id/:socketId",
    element: (
      <UserAuth>
        <ChatBox />
      </UserAuth>
    )
  },
  {
    path: "/dashboard/globalChat",
    element: (
      <UserAuth>
        <GlobalChat />
      </UserAuth>
    )
  },
  {
    path: '/groupChat/:grpName/:id',
    element: (
      <UserAuth>
        <GroupChat />
      </UserAuth>
    )
  },
  {
    path: '/videoChat/:id',
    element: (
      <UserAuth>
        <VideoPlayer />
      </UserAuth>
    )
  }
]);



createRoot(document.getElementById('root')).render(

  <WebSocketProvider>
    <UserContextProvider>
      <PeerProvider>
        <Toaster />
        <RouterProvider router={router} />
      </PeerProvider>
    </UserContextProvider>
  </WebSocketProvider>
)
