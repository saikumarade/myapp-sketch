import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface UserCursorsProps {
  users: User[];
  currentUserId?: string;
}

export const UserCursors: React.FC<UserCursorsProps> = ({ users, currentUserId }) => {
  return (
    <>
      {users
        .filter(user => user.id !== currentUserId && user.cursor)
        .map(user => (
          <div
            key={user.id}
            className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{
              left: user.cursor!.x,
              top: user.cursor!.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor */}
            <MousePointer2 
              className="w-5 h-5 drop-shadow-lg"
              style={{ color: user.color }}
            />
            
            {/* User name label */}
            <div
              className="absolute top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded-md shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        ))}
    </>
  );
};