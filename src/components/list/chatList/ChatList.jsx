import React, { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/addUser'; 
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from '../../../lib/chatStore'; 
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc
import { db } from "../../../lib/firebase";

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState('');
    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(() => {
        const fetchChats = async () => {
            if (currentUser && currentUser.id) {
                const docRef = doc(db, "userchats", currentUser.id);
                const unSub = onSnapshot(docRef, async (snapshot) => {
                    const items = snapshot.data()?.chats || [];

                    const promises = items.map(async (item) => {
                        const userDocRef = doc(db, "users", item.receiverId);
                        const userDocSnap = await getDoc(userDocRef);
                        const user = userDocSnap.data();

                        return { ...item, user };
                    });

                    const chatData = await Promise.all(promises);
                    const sortedChats = chatData.sort((a, b) => b.updatedAt - a.updatedAt);
                    setChats(sortedChats);
                });

                return () => unSub();
            }
        };

        fetchChats();
    }, [currentUser]);

    const handleSelect = async (chat) => {
        const updatedChats = chats.map(item => {
            const { user, ...rest } = item;
            if (item.chatId === chat.chatId) {
                return { ...rest, isSeen: true, user };
            }
            return { ...rest, user };
        });

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: updatedChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }
    }

    const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className='chatList'>
            <div className="search">
                <div className="searchBar">
                    <img src="/search.png" alt=""/>
                    <input type="text" placeholder="Search" value={input} onChange={(e) => setInput(e.target.value)}/>
                </div>
                <img 
                    src={addMode ? "./minus.png" : "./plus.png"} 
                    alt="" 
                    className="add" 
                    onClick={() => setAddMode((prev) => !prev)} 
                />
            </div>
            {chats.length === 0 ? (
                <div className="loading">Loading chats...</div>
            ) : filteredChats.length === 0 ? (
                <div className="noResults">No results found.</div>
            ) : (
                filteredChats.map((chat) => (
                    <div 
                        className="item" 
                        key={chat.chatId} 
                        onClick={() => handleSelect(chat)}
                        style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
                    >
                        <img src={chat.user.blocked && chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt=""/>
                        <div className="texts">
                            <span>{chat.user.blocked && chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
                            <p>{chat.lastMessage}</p>
                        </div>
                    </div>
                ))
            )}
            {addMode && <AddUser />}
        </div>
    );
}

export default ChatList;
