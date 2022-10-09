const db = require('../common/connection');

const Token = (token) => {
    this.id = token.id;
    this.userId = token.userId;
    this.refreshToken = token.refreshToken;
    this.expiresIn = token.expiresIn;
    this.createdAt = token.createdAt;
    this.updatedAt = token.updatedAt;
}

Token.create = (data) => {
    return new Promise((resolve) => {
        db.query(`INSERT INTO Tokens (userId, refreshToken, expiresIn, createdAt, updatedAt)
        VALUES ('${data.userId}', '${data.refreshToken}', '${data.expiresIn}', '${data.createdAt}', '${data.updatedAt}')`, (err, token) => {
            if (err) resolve(null);
            resolve({id: token.insertId, ...token});
        });
    });
};

Token.update = (data) => {
    return new Promise((resolve) => {
        db.query(`UPDATE Tokens
        SET refreshToken = '${data.refreshToken}', updatedAt = '${data.updatedAt}'
        WHERE userId = '${data.userId}'`, (err, token) => {
            if (err) resolve(null);
            resolve(token);
        });
    });
};


Token.deleteByUserId = (userId) => {
    return new Promise((resolve) => {
        db.query(`DELETE FROM Tokens WHERE userId = '${userId}'`, (err, data) => {
            if (err) resolve(null);
            resolve(data);
        });
    });
};

module.exports = Token;