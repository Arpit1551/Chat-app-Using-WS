import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const peerConnectionContext = createContext();

export const usePeerConnection = () => useContext(peerConnectionContext);

export const PeerProvider = ({ children }) => {

    const peerConnection = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }
        ]
    }), []);

    const createOffer = async () => {
        const offer = peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    };

    const createAnswer = async (offer) => {
        await peerConnection.setRemoteDescription(offer);
        const answer = peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    };

    const setRemoteDescription = async (answer) => {
        await peerConnection.setRemoteDescription(answer);
    };

    return (
        <peerConnectionContext.Provider value={{ peerConnection, createOffer, createAnswer, setRemoteDescription}}>
            {children}
        </peerConnectionContext.Provider>
    )
}