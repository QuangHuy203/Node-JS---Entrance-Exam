let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('/POST sign-in', () => {
    it('Case sign-up success', (done) => {
        let input = {
            email: "test111@email.com",
            password: "password123"
        };
        chai.request(server)
            .post('/authentication/sign-in')
            .send(input)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('Case sign-up failed', (done) => {
        let input = {
            email: "test111email.com",
            password: "password123"
        };
        chai.request(server)
            .post('/authentication/sign-in')
            .send(input)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});