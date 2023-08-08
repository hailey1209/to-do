const mongoose = require('mongoose')

const { Schema } = mongoose  //== mongoose.Schema = mongoose
const { Types: {ObjectId} } = Schema

const todoSchema = new Schema({ //스키마 정의
    author: {
        type: ObjectId, //사용자의 아이디
        required: true, //항상 들어가있어야 몽고에서  오류가 안남
        ref: 'User' //사용자 모델을 참조
    },
    title: {
        type: String,
        required: true,
        trim: true  //데이터의공백을 조정해줌
    },
    description:{ //option
        type: String,
        trim: true
    },
    isDone: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    finishedAt: {
        type: Date,
        default: Date.now
    }
})

const Todo =mongoose.model('Todo', todoSchema) //Todo => todos(컬렉션 이름)
module.exports =Todo //외부에서 사용할수있게 허용

// todo 데이터 생성 테스트
// const todo = new Todo({
//     author: '111111111111111111111111', //mongo db 고유 id 값 ,24자리
//     title: '  주말에 공원 산책하기  ',
//     description: '주말에 집 주변에 있는 공원에 가서 1시간 동안 산책하기',
// })

// //데이터베이스 접속 => 비동기
// todo.save() //insert, insertMany (mongo db)
// .then(()=> console.log('todo created !'))
// .catch(e=> console.log(`Fail to create todo: ${e}`))