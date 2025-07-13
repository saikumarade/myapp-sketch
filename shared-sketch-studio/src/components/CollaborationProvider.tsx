import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DrawingStroke } from './DrawingCanvas';
import { useToast } from '@/hooks/use-toast';

// WebSocket types for collaboration
interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface CollaborationContextType {
  isConnected: boolean;
  currentUser: User | null;
  connectedUsers: User[];
  sendStroke: (stroke: DrawingStroke) => void;
  sendClearCanvas: () => void;
  onStrokeReceived: (callback: (stroke: DrawingStroke) => void) => void;
  onCanvasClearReceived: (callback: () => void) => void;
  updateCursor: (x: number, y: number) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
  websocketUrl?: string; // Optional - for when backend is connected
  roomId?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  websocketUrl,
  roomId = 'default-room',
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [strokeCallback, setStrokeCallback] = useState<((stroke: DrawingStroke) => void) | null>(null);
  const [clearCallback, setClearCallback] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  // Generate random user color
  const generateUserColor = () => {
    const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF', '#FF8844', '#8844FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initialize user
  useEffect(() => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: generateUserColor(),
    };
    setCurrentUser(user);
    setConnectedUsers([user]); // Start with current user
  }, []);

  // WebSocket connection (when backend is available)
  useEffect(() => {
    if (!websocketUrl || !currentUser) return;

    try {
      const ws = new WebSocket(`${websocketUrl}?room=${roomId}&userId=${currentUser.id}`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        toast({
          title: "Connected",
          description: "Successfully connected to collaboration server",
        });

        // Send user join event
        ws.send(JSON.stringify({
          type: 'user-join',
          user: currentUser,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'stroke':
              strokeCallback?.(data.stroke);
              break;
            case 'clear-canvas':
              clearCallback?.();
              break;
            case 'users-update':
              setConnectedUsers(data.users);
              break;
            case 'user-cursor':
              // Update user cursor position
              setConnectedUsers(prev => 
                prev.map(user => 
                  user.id === data.userId 
                    ? { ...user, cursor: data.cursor }
                    : user
                )
              );
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        toast({
          title: "Disconnected",
          description: "Lost connection to collaboration server",
          variant: "destructive",
        });
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to collaboration server",
          variant: "destructive",
        });
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [websocketUrl, roomId, currentUser, strokeCallback, clearCallback, toast]);

  // Send drawing stroke to other users
  const sendStroke = (stroke: DrawingStroke) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'stroke',
        stroke,
        userId: currentUser?.id,
      }));
    }
  };

  // Send clear canvas event
  const sendClearCanvas = () => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'clear-canvas',
        userId: currentUser?.id,
      }));
    }
  };

  // Update cursor position
  const updateCursor = (x: number, y: number) => {
    if (socket && isConnected && currentUser) {
      socket.send(JSON.stringify({
        type: 'cursor-move',
        userId: currentUser.id,
        cursor: { x, y },
      }));
    }
  };

  // Register callback for received strokes
  const onStrokeReceived = (callback: (stroke: DrawingStroke) => void) => {
    setStrokeCallback(() => callback);
  };

  // Register callback for canvas clear
  const onCanvasClearReceived = (callback: () => void) => {
    setClearCallback(() => callback);
  };

  const value: CollaborationContextType = {
    isConnected,
    currentUser,
    connectedUsers,
    sendStroke,
    sendClearCanvas,
    onStrokeReceived,
    onCanvasClearReceived,
    updateCursor,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};