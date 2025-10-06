

// WebSocket service for co-op modes

let socket = null;

export function connectWebSocket(userId, roomId) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket already connected');
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const url = `${protocol}//${host}/`;

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('WebSocket connected');

    // Join the quest room
    if (userId && roomId) {
      joinQuest(roomId, userId);
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('WebSocket message received:', data);

    switch(data.type) {
      case 'QUEST_STARTED':
        // Handle quest start
        break;
      case 'PROGRESS_SYNC':
        // Sync progress when joining a room
        break;
      case 'PROGRESS_UPDATE':
        // Update UI with shared progress
        break;
      case 'QUEST_ENDED':
        // Handle quest end
        break;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    socket = null;
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export function joinQuest(roomId, userId) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected when trying to join quest');
    return;
  }

  const message = {
    type: 'JOIN_QUEST',
    roomId,
    userId
  };

  socket.send(JSON.stringify(message));
}

export function leaveQuest(roomId, userId) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected when trying to leave quest');
    return;
  }

  const message = {
    type: 'LEAVE_QUEST',
    roomId,
    userId
  };

  socket.send(JSON.stringify(message));
}

export function syncProgress(roomId, progress) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected when trying to sync progress');
    return;
  }

  const message = {
    type: 'SYNC_PROGRESS',
    roomId,
    progress
  };

  socket.send(JSON.stringify(message));
}

export function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

