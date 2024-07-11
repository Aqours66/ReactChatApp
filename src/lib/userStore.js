import { create } from 'zustand';
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore"; // Correct import path

export const useUserStore = create((set) => ({
    currentUser: null,
    isLoading: false, // Initialized to false
    fetchUserInfo: async(uid) => {
        if (!uid) {
            set({ currentUser: null, isLoading: false });
            return;
        }

        set({ isLoading: true }); // Set loading state to true when fetching starts

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false });
            } else {
                set({ currentUser: null, isLoading: false });
            }
        } catch (err) {
            console.log(err);
            set({ currentUser: null, isLoading: false });
        }
    },
}));