import React, { useContext, useState } from "react";
import { createContext, useEffect, useRef } from "react";
import { UserContext } from "./userContext";

export const webSocketContext = createContext(null);

export const WebSocketProvider = ({children})=>{

    const ws = useRef(null);
    const [socketInstance, setSocketInstance] = useState(null);

    const setUser = useContext(UserContext);
    useEffect(() => {
      const socket = new WebSocket("ws://localhost:8080");
      ws.current = socket;

      ws.current.onopen = ()=>{
        console.log('Connection is open!')
        setSocketInstance(socket);
      };

      ws.current.onclose = ()=>{
        setUser({
          status:'offline'
        });
        console.log("User is disconnected")
      };

      return  ()=> {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.close();
        }
      };
    }, []);

return(
    <webSocketContext.Provider value={{ws:socketInstance}}>
        {children}
    </webSocketContext.Provider>
)
};

