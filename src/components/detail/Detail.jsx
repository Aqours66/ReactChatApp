import React from 'react';
import "./detail.css";
import { auth } from "../../lib/firebase"; // Ensure auth is imported correctly
import { useChatStore } from '../../lib/chatStore'; // Ensure correct import
import { useUserStore } from '../../lib/userStore'; // Ensure correct import
import { doc, updateDoc } from 'firebase/firestore'; // Ensure correct import for Firestore
import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust the path as per your project structure


const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return; // Ensure user is available before proceeding

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      // Optionally, update local state or trigger changeBlock function
      changeBlock(); // Ensure this function exists and handles state updates
    } catch (err) {
      console.error("Error blocking user:", err);
      // Implement error handling (e.g., show a message to the user)
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username}</h2>
        <p>{user?.status || "No status available"}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow Down" />
          </div>
          {/* Example of dynamically rendering shared photos */}
          <div className="photos">
            {user?.sharedPhotos?.map((photo, index) => (
              <div className="photoItem" key={index}>
                <div className="photoDetail">
                  <img src={photo.url} alt="Shared Photo" />
                  <span>{photo.name}</span>
                </div>
                <img src="./download.png" alt="Download Icon" className="icons" />
              </div>
            ))}
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow Up" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked ? "You Are Blocked!" : isReceiverBlocked ? "User Blocked!" : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
