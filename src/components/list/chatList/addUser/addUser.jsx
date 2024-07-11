import "./addUser.css";
import { useState } from "react";
import { db } from "../../../../lib/firebase";
import {
    doc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp
} from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const username = formData.get("username");

            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUser(doc.data());
                });
            } else {
                setUser(null); // Reset user state if no user found
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        try {
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createAt: serverTimestamp(),
                messages: [],
            });

            if (user && currentUser) {
                await updateDoc(doc(userChatsRef, user.id), {
                    chats: arrayUnion({
                        chatId: newChatRef.id,
                        lastMessage: "",
                        receiverId: currentUser.id,
                        updatedAt: Date.now(),
                    }),
                });

                await updateDoc(doc(userChatsRef, currentUser.id), {
                    chats: arrayUnion({
                        chatId: newChatRef.id,
                        lastMessage: "",
                        receiverId: user.id,
                        updatedAt: Date.now(),
                    }),
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
               <input type="text" placeholder="Username" name="username" />
               <button>Search</button>
            </form>
            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={user.avatar || "./avatar.png"} alt="" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd}>Add User</button>
                </div>
            )}
        </div>
    );
};

export default AddUser;
