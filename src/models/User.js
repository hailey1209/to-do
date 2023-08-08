const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,//unique : 색인(primary key), 이메일은 중복 불가
    },
    userId: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now,
    }
})

const User = mongoose.model('User', userSchema) //User => users (컬렉션 이름)
module.exports = User

//User 데이터 생성 테스트
// const user = new User({
//     name: 'hailey',
//     email: 'hailey@gmail.com',
//     userId: 'Hailey',
//     password: '1234567890',
//     isAdmin: true,
// })
// user.save()
// .then(()=> console.log('user created!'))
// .catch(e=> console.log(`Failed to create user: ${e}`))