const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler') 
const { isAuth } = require('../../auth')

const mongoose = require('mongoose')
const { Types: {ObjectId}} = mongoose


const router = express.Router()

// /api/todos/
router.get('/', isAuth, expressAsyncHandler(async (req, res, next)=> {
    const todos =await Todo.findOne({author: req.user._id}).populate("author")
    if(todos.length === 0){
        res.status(404).json({code: 404, message: "failed to find todos"})
    }else{
        res.status(200).json({code:200, todos})
    }
}))

// /api/todos/:id
//사용자의 특정 할일 조회
router.get('/:id', isAuth, expressAsyncHandler(async (req, res, next)=> {
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'todo not found'})
    }else{
        res.json({code: 200, todo})
    }
}))

// /api/todos/
router.post('/',isAuth, expressAsyncHandler(async (req, res, next)=> {
    //todo 중복체크(현재 사용자가 생성하려는 todo의 타이틀이 이미 db에 있는지 확인)
    const searchedTodo = await Todo.findOne({
        author: req.user._id,
        title: req.body.title
    })
    if(searchedTodo){
        res.status(204).json({code: 204, message: 'Todo you want to create already exists in DB'})
    }else{
        const todo = new Todo({
            author: req.user._id, //사용자 아이디
            title: req.body.title,
            description: req.body.description,
            category: req.body.category, //추가
            imgURL: req.body.imgURL //추가
        })
        const newTodo = await todo.save() //새롭게 생성된 todo를 db에 저장
        if(!newTodo){
            res.status(401).json({code: 401, message: "failed to save todo"})
        }else{
            res.status(201).json({ //생성된 todo를 브라우저에 띄울수 있도록 브라우저에 전송
                code: 201,
                message: 'New Todo Created.',
                newTodo //db에 저장된 할일
            })
        }
    }
}))

// /api/todos/:id
router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next)=> {
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'Todo not found'})
    }else{
        todo.title = req.body.title || todo.title
        todo.description = req.body.description || todo.description
        todo.isDone = req.body.isDone || todo.isDone //할일이 수행이 되었으면 true, 아니면 false
        todo.category = req.body.category || todo.category //추가
        todo.imgURL = req.body.imgURL || todo.imgURL       // 추가
        todo.lastModifiedAt = new Date() //수정된 시각 업데이트
        todo.finishedAt = todo.isDone ? todo.lastModifiedAt : todo.finishedAt
        //todo의 수행여부가 참이면 수행이 완료된 값을 반환하고 거짓이면 마지막 수정날짜를 반환

        const updatedTodo = await todo.save() //db에 수정된 todo를 업데이트
        res.json({
            code: 200,
            message: 'Todo has been updated',
            updatedTodo //브라우저에 업데이트된 정보를 전송
        })
    }
}))

// /api/todos/:id
router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next)=> {
    const todo = await Todo.findOne({
        author: req.user._id,
        _id: req.params.id
    })
    if(!todo){
        res.status(404).json({code: 404, message: 'Todo not found'})
    }else{
        await Todo.deleteOne({
            author: req.user._id,
            _id: req.params.id
        })
        res.status(204).json({code: 204, message: 'Todo deleted successfully !'})
    }
}))


//관리자 => 필드별 그룹핑
router.get('/group/:field', isAuth, expressAsyncHandler(async(req,res,next)=>{
    if(!req.user.isAdmin){
        res.status(401).json({code: 401, message: 'You are not authorized to use this service'})
    }else{
        const docs = await Todo.aggregate([
            {
                $group: {
                    _id: `$${req.params.field}`,
                    count: {$sum: 1}
                }
            }
        ])

        console.log(`Number of Group: ${docs.length}`) //그룹 갯수
        docs.sort( (d1, d2) => d1._id - d2._id) // 데이터 오름차순 정렬
        res.json({ code: 200, docs})
    }
}))

//사용자=> 필드별 그룹핑
router.get('/group/mine/:field', isAuth, expressAsyncHandler(async (req, res, next)=> {
    const docs = await Todo.aggregate([
        {
            $match: {
                author: new ObjectId(req.user._id) //나의 할일 목록 필터링
            }
        },
        {
            $group: {
                _id: `$${req.params.field}`,
                count: { $sum: 1}
            }
        }
    ])
    console.log(`Number of Group: ${docs.length}`) //그룹 갯수
    docs.sort( (d1, d2) => d1._id - d2._id) // 데이터 오름차순 정렬
    res.json({ code: 200, docs})
}))

//관리자=> 날짜별 그룹핑
router.get('/group/date/:field', isAuth, expressAsyncHandler(async (req, res, next)=> {
    if(!req.user.isAdmin){
        res.status(401).json({code: 401, message: '권한이 없습니다!'})
    }else{
        if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt' || req.params.field === 'finishedAt'){
            const docs = await Todo.aggregate([
                {
                    $group: {
                        _id: { year: {$year: `$${req.params.field}`}, month: { $month: `$${req.params.field}`}},
                        count: {$sum: 1}
                    }
                },
                {$sort: {_id: 1}} //날짜 오름 차순 정렬
            ])

            console.log(`Number of Group: ${docs.length}`) //그룹 갯수
            docs.sort( (d1, d2) => d1._id - d2._id) // 데이터 오름차순 정렬
            res.json({ code: 200, docs})
        }else{
            res.status(204).json({ code: 204, message: 'No Content'})
        }
    }
}))

//사용자=> 날짜별 그룹핑
router.get('/group/mine/date/:field', isAuth, expressAsyncHandler(async (req, res, next)=> {
    if(req.params.field === 'createdAt' || req.params.field === 'lastModifiedAt' || req.params.field === 'finishedAt'){
        const docs = await Todo.aggregate([
            {
                $match: { author: new ObjectId(req.user._id)}
            },
            {
                $group: {
                    _id: { year: {$year: `$${req.params.field}`}, month: { $month: `$${req.params.field}`}},
                    count: {$sum: 1}
                }
            },
            {$sort: {_id: 1}} //날짜 오름 차순 정렬
        ])
        console.log(`Number of Group: ${docs.length}`) //그룹 갯수
        docs.sort( (d1, d2) => d1._id - d2._id) // 데이터 오름차순 정렬
        res.json({ code: 200, docs})
    }else{
        res.status(204).json({ code: 204, message: 'No Content'})
    }
}))
module.exports = router