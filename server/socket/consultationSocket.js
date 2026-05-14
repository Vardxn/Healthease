const Consultation = require('../models/Consultation');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-patient-room', ({ patientId }) => {
            if (!patientId) {
                return;
            }

            socket.join(`patient:${patientId}`);
        });

        socket.on('join-room', ({ consultationId, userId, userName, peerId, role }) => {
            if (!consultationId) {
                return;
            }

            const room = `consultation:${consultationId}`;
            socket.join(room);
            socket.data.consultationId = consultationId;

            socket.to(room).emit('user-connected', {
                socketId: socket.id,
                userId: userId || null,
                userName: userName || 'Participant',
                peerId: peerId || null,
                role: role || null,
                consultationId
            });
        });

        socket.on('send-message', ({ consultationId, message, sender }) => {
            if (!consultationId || !message) {
                return;
            }

            const room = `consultation:${consultationId}`;
            io.to(room).emit('message-received', {
                consultationId,
                message,
                sender: sender || null,
                sentAt: new Date().toISOString()
            });
        });

        socket.on('signal', ({ consultationId, targetSocketId, signalData, fromPeerId }) => {
            if (!consultationId || !signalData) {
                return;
            }

            const payload = {
                consultationId,
                signalData,
                fromSocketId: socket.id,
                fromPeerId: fromPeerId || null
            };

            if (targetSocketId) {
                io.to(targetSocketId).emit('signal', payload);
                return;
            }

            const room = `consultation:${consultationId}`;
            socket.to(room).emit('signal', payload);
        });

        socket.on('end-call', async ({ consultationId, endedBy }) => {
            if (!consultationId) {
                return;
            }

            try {
                await Consultation.findByIdAndUpdate(
                    consultationId,
                    {
                        $set: {
                            status: 'completed',
                            endedAt: new Date()
                        }
                    },
                    { new: true }
                );
            } catch (err) {
                console.error('Socket end-call update error:', err);
            }

            const room = `consultation:${consultationId}`;
            io.to(room).emit('call-ended', {
                consultationId,
                endedBy: endedBy || socket.id,
                endedAt: new Date().toISOString()
            });
        });
    });
};
