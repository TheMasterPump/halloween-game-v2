// Script pour nettoyer les données de test des bots dans Firebase
// À exécuter UNE SEULE FOIS dans la console du navigateur après avoir ouvert index.html

(async function cleanupBots() {
  console.log('🧹 Starting cleanup of bot test data...');

  const rtdb = firebase.database();

  try {
    // 1. Nettoyer toutes les rooms
    console.log('📦 Cleaning rooms...');
    const roomsRef = rtdb.ref('rooms');
    const roomsSnapshot = await roomsRef.once('value');

    if (roomsSnapshot.exists()) {
      const rooms = roomsSnapshot.val();
      let roomsDeleted = 0;

      for (const roomId in rooms) {
        const room = rooms[roomId];
        const players = room.players || {};

        // Vérifier s'il y a des bots dans la room
        const hasBots = Object.keys(players).some(playerId =>
          playerId.startsWith('bot_') ||
          players[playerId].name === 'DegBot' ||
          players[playerId].name === 'Trencher' ||
          players[playerId].name === 'MoonBoi' ||
          players[playerId].name === 'DiamondAI'
        );

        if (hasBots) {
          await rtdb.ref(`rooms/${roomId}`).remove();
          roomsDeleted++;
          console.log(`  ✅ Deleted room: ${roomId}`);
        }
      }

      console.log(`✅ Rooms cleaned: ${roomsDeleted} rooms with bots deleted`);
    } else {
      console.log('ℹ️ No rooms found');
    }

    // 2. Nettoyer les sessions de présence anciennes (optionnel)
    console.log('👥 Cleaning old presence sessions...');
    const presenceRef = rtdb.ref('presence');
    const presenceSnapshot = await presenceRef.once('value');

    if (presenceSnapshot.exists()) {
      const sessions = presenceSnapshot.val();
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000); // 1 heure
      let sessionsDeleted = 0;

      for (const sessionId in sessions) {
        const session = sessions[sessionId];
        if (session.lastSeen < oneHourAgo) {
          await rtdb.ref(`presence/${sessionId}`).remove();
          sessionsDeleted++;
        }
      }

      console.log(`✅ Presence cleaned: ${sessionsDeleted} old sessions deleted`);
    } else {
      console.log('ℹ️ No presence sessions found');
    }

    console.log('');
    console.log('🎉 Cleanup completed successfully!');
    console.log('✨ Your Firebase database is now clean and ready for production!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
})();
