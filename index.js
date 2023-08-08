const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('morgan')
const mongoose =require('mongoose')
const axios = require('axios')
// const todo = require('./src/models/Todo')
// const user =require('./src/models/User')

const corsOptions = { //CORS옵션
    origin: 'http://127.0.0.1:5500', //해당 URL주소만 요청을 허락함
    credentials : true //사용자 인증이 필요한 리소스를 요청 할 수있도록 허용함
}

const CONNECT_URL = 'mongodb://127.0.0.1:27017/hailey'
mongoose.connect(CONNECT_URL) //mongodb 연동
.then(()=> console.log("mongodb connected..."))
.catch(e=> console.log(`failed to connect mongodb: ${e}`))

//공통적으로 요청하는 미들웨어
app.use(cors(corsOptions)) //CORS 설정
app.use(express.json()) //request.body 파싱
app.use(logger('tiny')) //logger 설정


app.get('/hello', (req, res)=> { //URL 응답 테스트
    res.json({msg: 'hello world!'})
})

app.post('/hello', (req, res)=> {
    console.log(req.body)
    res.json({userId: req.body.userId, email: req.body.email})
})

app.get('/fetch', async(req, res)=> {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
    res.send(response.data)
})

app.get('/error', (req, res)=> {
    throw new Error('서버에 에러가 발생 하였습니다!')
})

//폴백 핸들러 (fallback handler)
app.use( (req, res, next)=> { //사용자가 요청한 페이지가 없는 경우 에러처리
    res.status(404).send('Page not found...')
})

app.use((err, req, res, next)=> {//서버 내부 오류처리
    console.error(err.stack)
    res.status(500).send('Internal server error...')
})

app.listen(5000, ()=> {
    console.log('server is running on port 5000...')
})