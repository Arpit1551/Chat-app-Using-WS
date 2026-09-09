import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { usePeerConnection } from '../context/PeerContex'
import { webSocketContext } from '../context/WebSocketContext';
import { UserContext } from '../context/userContext';

function VideoPlayer() {

    const { ws } = useContext(webSocketContext);
    const { user } = useContext(UserContext);

    const { peerConnection, createOffer, createAnswer, setRemoteDescription } = usePeerConnection();

    const senderId = localStorage.getItem('sendTo');

    if (ws) {
        ws.send(JSON.stringify({ type: 'answeringCall', senderId: senderId, id: user.userId }));
    }

    useEffect(() => {
        if (!ws) return;

        peerConnection.onicecandidate = async (event) => {
            if (event.candidate && ws) {
                await ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    sendTo: senderId
                }))
            }
        };
    }, [peerConnection, ws]);

    if (ws) {
        ws.onmessage = async (info) => {
            const data = JSON.parse(info.data);

            if (data.type === 'answer') {
                const offer = await createOffer();
                ws.send(JSON.stringify({
                    type: 'offer',
                    offer: offer,
                    sendTo: data.senderId
                }))
            }
            else if (data.type === 'createAnswer') {
                const answer = await createAnswer(data.offer);
                ws.send(JSON.stringify({
                    type: 'answeringTheOffer',
                    answer: answer,
                    sendTo: data.senderId
                }))
            }
            else if (data.type === 'offerAnswer') {
                await setRemoteDescription(data.answer);
            }
            else if (data.type === 'ice-candidate') {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        }
    }

    let stream = useRef();
    let remoteStream = useRef();

    const userStream = useCallback(async () => {
        const userMedia = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
        });
        stream.current.srcObject = userMedia;

        userMedia.getTracks().forEach((track) => {
            peerConnection.addTrack(track, userMedia);
        });
    }, [peerConnection]);

    useEffect(() => {
        userStream();
    }, [userStream]);

    useEffect(() => {
        const handleTrack = (ev) => {
            if (ev?.streams && ev.streams[0]) {
                remoteStream.current.srcObject = ev.streams[0];
            }
        };

        peerConnection.addEventListener('track', handleTrack);

        return () => {
            peerConnection.removeEventListener('track', handleTrack);
        };
    }, [peerConnection]);


    useEffect(() => {
        const pc = peerConnection;
        if (!pc) return;

        const handleNegotiation = async () => {
            if (pc.signalingState !== 'stable') return;

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            ws.send(JSON.stringify({
                type: 'offer',
                offer,
                sendTo: senderId
            }));
        };

        pc.addEventListener('negotiationneeded', handleNegotiation);
        return () => pc.removeEventListener('negotiationneeded', handleNegotiation);
    }, []);
    return (
        <>
            <div id="videos" className='border 2px m-3 p-2 py-5 bg-blue-500 rounded-md flex justify-center gap-[4em]'>
                <video ref={stream} className="video w-[40%] rounded-2xl bg-black border-yellow-500 border-8" id="user-1" autoPlay></video>
                <video ref={remoteStream} className="video border-8 w-[40%] rounded-2xl bg-black border-red-500" id="user-2" autoPlay></video>
            </div>
        </>
    )
}

export default VideoPlayer