const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedTestUsers = async () => {
    try {
        const testUsers = [
            {
                name: 'John Patient',
                email: 'john@test.com',
                password: 'easy123',
                role: 'patient'
            },
            {
                name: 'Dr. Smith',
                email: 'smith@test.com',
                password: 'care123',
                role: 'doctor'
            },
            {
                name: 'System Admin',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin'
            }
        ];

        for (const u of testUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(u.password, salt);
                
                user = new User({
                    name: u.name,
                    email: u.email,
                    passwordHash,
                    role: u.role
                });
                await user.save();
                console.log(`Seeded test user: ${u.email}`);
            }
        }
        console.log('Test users seed check complete.');
    } catch (err) {
        console.error('Error seeding test users:', err);
    }
};

module.exports = seedTestUsers;
