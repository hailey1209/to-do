const dotenv =require('dotenv')

dotenv.config()  //process.env 객체에 .env 파일의 환경 변수 주입

module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
}
// process.env.MONGODB_URL => config.MONGOBD_URL