import { create } from 'zustand';
import { useUserStore } from './userStore'; // Assuming useUserStore is correctly imported

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser; // Potential issue: Direct usage of hook

        if (!currentUser) {
            console.error('Current user not found.');
            return;
        }

        if (user.blocked.includes(currentUser.id)) {
            set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        } else if (currentUser.blocked.includes(user.id)) {
            set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {
            set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },
    changeBlock: () => {
        set((state) => ({
            ...state,
            isReceiverBlocked: !state.isReceiverBlocked,
        }));
    },
}));

export default useChatStore;