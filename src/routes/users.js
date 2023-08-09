const express = require('express')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')
const { generateToken, isAuth } = require('../../auth')

const router = express.Router() //하위 url 로직을 처리하는 라우터 모듈

// /api/users/register
router.post('/register', expressAsyncHandler( async (req, res, next) => {
    console.log(req.body)
    const user = new User({  //입력된 사용자 정보를 메모리에 저장
        name: req.body.name,
        email: req.body.email,
        userId: req.body.userId,
        password: req.body.password,
    })
    const newUser = await user.save() //db에 user 생성
    if(!newUser){
        res.status(401).json({ code: 401, message: 'Invaild User Data'})
    }else{
        const { name, email, userId, isAdmin, createdAt } = newUser
        res.json({
            code: 200,
            token: generateToken(newUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

// /api/users/login
router.post('/login', expressAsyncHandler(async (req, res, next)=> {
    console.log(req.body)
    const loginUser = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    })
    if(!loginUser){
        res.status(401).json({code: 401, message: 'Invalid Email or password'})
    }else{
        const { name, email, userId, isAdmin, createdAt } = loginUser
        res.json({
            code: 200,
            token: generateToken(loginUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

//  /api/users/logout
router.post('/logout', (req, res ,next)=> {
    res.json('로그아웃')
})

// /api/users/:id
// isAuth: 사용자를 수정할 권한이 있는지 검사하는 미들웨어
router.put('/:id', isAuth, expressAsyncHandler(async( req, res, next)=> {
    const user = await User.findById(req.params.id)
    if(!user){
        res.status(404).json({ code: 404, message: 'User not found'})
    }else{
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.password = req.body.password || user.password
        const updatedUser = await user.save() //변경된 정보를 db에 업데이트 해줌
        const { name, email, userId, isAdmin, createdAt } = updatedUser //업데이트된 정보를 저장
        res.json({
            code: 200,
            token: generateToken(updatedUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

// /api/users/:id
router.delete('/:id', isAuth, expressAsyncHandler(async(req, res, next)=> {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user){
        res.status(404).json({ code: 404, message: 'User not found'})
    }else{
        res.status(204).json( {code: 204, message: 'User deleted successfully'})
    }
}))
module.exports = router