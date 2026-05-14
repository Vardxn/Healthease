let _io;

module.exports = {
    init: (io) => {
        _io = io;
    },
    getIO: () => {
        if (!_io) {
            throw new Error('io not initialized');
        }
        return _io;
    }
};
