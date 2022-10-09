const db = require('../common/connection');

const User = (user) => {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.password = user.password;
    this.updatedAt = user.updatedAt;
    this.createdAt = user.createdAt;
};

User.getAll = () => {
    return new Promise((resolve) => {
        db.query('SELECT * FROM Users', (err, data) => {
            if (err) resolve(null);
            resolve(data);
        });
    });
};

User.getByEmail = (email) => {
    return new Promise((resolve) => {
        db.query(`SELECT * FROM Users WHERE email = '${email}'`, (err, data) => {
            if (err || data.length === 0) resolve(null);
            resolve(data[0]);
        });
    });
};

User.create = (data) => {
    return new Promise((resolve) => {
        db.query(`INSERT INTO Users (firstName, lastName, email, password, createdAt)
        VALUES ('${data.firstName}', '${data.lastName}', '${data.email}', '${data.password}', '${data.createdAt}')`, (err, user) => {
            if (err) resolve(null);
            resolve({id: user.insertId, ...data});
        });
    });
};

module.exports = User;