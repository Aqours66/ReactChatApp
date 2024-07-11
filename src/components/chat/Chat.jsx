import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

const Chat = () => {
    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    const [chat, setChat] = useState(null);
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const endRef = useRef(null);

    useEffect(() => {
        if (!chatId) return;

        const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
            setChat(res.data());
            scrollToBottom();
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const upload = async (file) => {
        // Implement your upload logic here
        // For example, using Firebase Storage:
        // const storageRef = ref(storage, `images/${file.name}`);
        // await uploadBytes(storageRef, file);
        // const downloadURL = await getDownloadURL(storageRef);
        // return downloadURL;
        return ""; // Replace with actual upload logic
    };

    const handleSend = async () => {
        if (text === '' && !img.file) return;

        let imgUrl = null;
        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }
        } catch (err) {
            console.error("Image upload failed: ", err);
        }

        try {
            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                })
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, 'userchats', id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

                    if (chatIndex >= 0) {
                        userChatsData.chats[chatIndex].lastMessage = text || "Image";
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }

        // Reset text and img state
        setText("");
        setImg({ file: null, url: "" });
    };

    return (
        <div className='chat'>
            <div className='top'>
                <div className='user'>
                    <img src={user?.avatar || './avatar.png'} alt='' />
                    <div className='texts'>
                        <span>{user?.username}</span>
                        <p>123</p>
                    </div>
                </div>
                <div className='icons'>
                    <img src='./phone.png' alt='' />
                    <img src='./video.png' alt='' />
                    <img src='./info.png' alt='' />
                </div>
            </div>
            <div className='center'>
                {chat?.messages?.map((message, index) => (
                    <div className={`message ${message.senderId === currentUser.id ? "message own" : "message"}`} key={index}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="Attached" />}
                            {message.text && <p>{message.text}</p>}
                            <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}

                {/* Display uploaded image preview */}
                {img.url && (
                    <div className={`message own`}>
                        <div className="texts">
                            <img src={img.url} alt="Preview" />
                        </div>
                    </div>
                )}

                <div ref={endRef}></div>
            </div>
            <div className='bottom'>
                <div className='icons'>
                    <label htmlFor="file">
                        <img src='./img.png' alt='' />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    <img src='./camera.png' alt='' />
                    <img src='./mic.png' alt='' />
                </div>
                <input
                    type='text'
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : 'Type a message...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className='emoji'>
                    <img src='./emoji.png' alt='' onClick={() => setOpen((prev) => !prev)} />
                    {open && (
                        <div className='picker'>
                            <EmojiPicker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
