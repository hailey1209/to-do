const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler') 
const { isAuth } = require('../../auth')

const router = express.Router()

// /api/todos/
router.get('/', (req, res, next)=> {
    res.json('전체목록 조회')
})

// /api/todos/:id
router.get('/:id', (req, res, next)=> {
    res.json('특정 할일 조회')
})

// /api/todos/
router.post('/', (req, res, next)=> {
    res.json("새로운 할일 생성")
})

// /api/todos/:id
router.put('/:id', (req, res, next)=> {
    res.json("특정 할일 변경")
})

// /api/todos/:id
router.delete('/:id', (req, res, next)=> {
    res.json("특정 할일 삭제")
})

module.exports = router