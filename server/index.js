import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import DB_Connection from './DbConnection.js';
import userModel from './model/userModel.js';
import groupModel from "./model/groupModel.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const wss = new WebSocketServer({ port: 8080 });
dotenv.config();
DB_Connection();

const connectedClients = new Map();
let groupMembers = [];

wss.on('connection', function (ws) {
    console.log("Connection is done!");

    ws.on('message', async (data) => {
        const mainInfo = JSON.parse(data);

            if (mainInfo.type === "globalMsg") {
                const msg = mainInfo.msg;

                wss.clients.forEach((client)=>{
                    if(client.id != ws.id && client.readyState === WebSocket.OPEN){
                        console.log(`Sender: ${ws.id} | Reciever: ${client.id}`);
                        client.send(JSON.stringify({type:'globalMsg' , msg:msg}));
                    }
                });
            }
            
            else if (mainInfo.type ==='singleChat'){
                wss.clients.forEach((client)=>{     
                    console.log(client.id, mainInfo.id);            
                    if(client.id === mainInfo.id){
                        return client.send(JSON.stringify({type:'singleChat' , msg:mainInfo.msg , clientId:ws.id}));
                    }
                });
            }

            else if(mainInfo.type === 'findGroup'){
                const grp = await groupModel.findById(mainInfo.groupId).populate('members','socketId');
                groupMembers = grp.members;
            }

            else if(mainInfo.type === 'groupChat'){
                wss.clients.forEach((socket)=>{
                    if(groupMembers.some(member => member._id.equals(mainInfo.senderId))){
                        socket.send(JSON.stringify({type:"grpMsg", msg:mainInfo.msg, senderName:mainInfo.senderName, senderId: mainInfo.senderId}));
                    }
                }) 
            }

            else if (mainInfo.type === "register") {

            const checkUser = await userModel.findOne({ email: mainInfo.value.email });
            if (checkUser) {
                return (
                    wss.clients.forEach((socket) => {
                        if (socket.id === ws.id) {
                            socket.send(JSON.stringify({ type: "sameEmail" }))
                        }
                    })
                )
            }

            const checkUserName = await userModel.findOne({ username: mainInfo.value.userName });
            if (checkUserName) {
                return (
                    wss.clients.forEach((socket) => {
                        if (socket.id === ws.id) {
                            socket.send(JSON.stringify({ type: "sameUserName" }))
                        }
                    })
                )
            }

            let token = jwt.sign({ email: mainInfo.value.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

            ws.id = crypto.randomUUID();
            const user = await userModel.create({
                username: mainInfo.value.userName,
                email: mainInfo.value.email,
                socketId: ws.id,
                password: mainInfo.value.password,
                accessToken: token,
                status:"Online"
            });
            user.save();

            connectedClients.set(ws.id, ws);
            wss.clients.forEach((socket) => {
                if (socket.id === ws.id) {
                    socket.send(JSON.stringify({ type: "token", token: token }));
                }
            })
        } else if(mainInfo.type === 'makingCall'){
            wss.clients.forEach((socket)=>{
                if(socket.id === mainInfo.socketId){
                    console.log(socket.id, mainInfo.socketId);
                    socket.send(JSON.stringify({type:'incomingCall', roomId: mainInfo.roomId, senderId: ws.id}));
                }
            })
        } else if(mainInfo.type === 'answeringCall'){
            wss.clients.forEach((socket)=>{
                if(socket.id === mainInfo.senderId){
                    socket.send(JSON.stringify({type:'answer', senderId: ws.id}));
                }
            })
        }
        else if(mainInfo.type === 'offer'){
            wss.clients.forEach((socket)=>{
                if(socket.id === mainInfo.sendTo){
                    socket.send(JSON.stringify({type:'createAnswer', offer:mainInfo.offer, senderId: ws.id}));
                }
            })
        }
        else if(mainInfo.type === 'answeringTheOffer'){
            wss.clients.forEach((socket)=>{
                if(socket.id === mainInfo.sendTo){
                    socket.send(JSON.stringify({type:'offerAnswer', answer:mainInfo.answer, senderId: ws.id}));
                }
            })
        }
        else if(mainInfo.type === 'ice-candidate'){
            wss.clients.forEach(async (socket)=>{
                if(socket.id === mainInfo.sendTo){
                    socket.send(JSON.stringify({type:'ice-candidate', candidate:mainInfo.candidate, senderId:ws.id}))
                }
            })
        }
        else if(mainInfo.type === 'login'){
            const user = await userModel.findOne({email:mainInfo.user.email});
            if(!user){
                return console.log('Unauthorised');
            };

            const checkPassword = await bcrypt.compare(mainInfo.user.password , user.password);
            if(!checkPassword){
                console.log('Incorrect Password');
            }

            const token = await jwt.sign({email:user.email}, process.env.JWT_SECRET , {expiresIn:'1h'});

            ws.id = crypto.randomUUID();
            user.socketId = ws.id;
            user.accessToken = token;
            user.status = 'Online';
            user.save();
            
            wss.clients.forEach((socket)=>{
                if(socket.id === ws.id){
                    ws.send(JSON.stringify({type:'userInfo', data:user}));
                }
            })
        }

        else if (mainInfo.type === 'UserAuth') {
            const token = mainInfo.token;
            try {
                const checkToken = jwt.verify(token, process.env.JWT_SECRET);
                const user = await userModel.findOne({ email: checkToken.email })
                .select('-password -accessToken')
                .populate('friends groups', '_id username socketId status name');
                ws.id = user.socketId;
                wss.clients.forEach((socket) => {
                    if (socket.id === ws.id) {
                        socket.send(JSON.stringify({ type : "latestUserInfo", userInfo: user }));
                    }
                })  
            } catch (error) {
                console.log(error);
            }
        }

        else if (mainInfo.type === "activeUsers") {

            const checkEntry = connectedClients.has(ws.id);
            if (!checkEntry) {
                connectedClients.set(ws.id, ws);
            };

            wss.clients.forEach((socket) => {
                socket.send(JSON.stringify({ type: "activeUsers", size: connectedClients.size }));
            });
        }

        else if(mainInfo.type === "addFriend"){
            const user = await userModel.findOne({_id:mainInfo.id});
            const friend = await userModel.findOne({username:mainInfo.username});
            if(!friend){
                return console.log("No user found!");
            }

            user.friends.push(friend._id);
            friend.friends.push(mainInfo.id);

            friend.save();
            user.save();
        }

        else if(mainInfo.type === 'createGroup'){
            const group = await groupModel.create({
                name:mainInfo.name,
                members:mainInfo.members,
                owner:mainInfo.owner           
            });

            group.save();

            mainInfo.members.forEach(async (member)=>{
                const user = await userModel.findById(member);
                user.groups.push(group._id);
                user.save();
            });

            wss.clients.forEach((socket)=>{
                if(mainInfo.members.includes(socket.id)){
                    socket.send(JSON.stringify({ type : "latestUserInfo"}))
                }
            })
        }

    });


    ws.on('close',async () => {
        connectedClients.delete(ws.id);
        
        // const user = await userModel.findOne({socketId:ws.id});
        // user.status = 'Offline';
        // user.save();

        wss.clients.forEach((socket) => {
            socket.send(JSON.stringify({ type: "activeUsers", size: connectedClients.size }));
        });
    });
});