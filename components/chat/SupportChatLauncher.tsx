
import React from 'react';
import { ChatBubbleOvalLeftEllipsisIconSolid } from '../icons/HeroIcons'; // Assuming a solid variant

const SupportChatLauncher = ({ onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:scale-105 z-[90]"
      aria-label="Open support chat"
    >
      <ChatBubbleOvalLeftEllipsisIconSolid className="w-7 h-7" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 block h-5 w-5 transform rounded-full bg-secondary text-white text-xs flex items-center justify-center border-2 border-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default SupportChatLauncher;
