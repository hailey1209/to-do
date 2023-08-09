const config = require('./config')
const jwt = require('jsonwebtoken')

const generateToken = (user)=> { //토큰 생성
    return jwt.sign({
        _id: user._id, //사용자 정보(json 문자열)
        name: user.email,
        userId: user.userId,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
    },
    config.JWT_SECRET, //jwt 비밀키
    {
        expiresIn: '1d', //만료기한 (하루)
        issuer: 'hailey',
    }
    )
}

//사용자 권한 검증하기
const isAuth = (req, res, next)=> { //권한을 확인하는 라우트 핸들러
    const bearerToken = req.headers.authorization //요청헤더에 저장된 토큰
    if(!bearerToken){
        res.status(401).json({message: 'Token is not supplied'}) //헤더에 토큰이 없는 경우
    }else{
        const token = bearerToken.slice(7, bearerToken.length) //Bearer 글자는 제거하고 jwt 토큰만 추출
        jwt.verify(token, config.JWT_SECRET, (err, userInfo)=>{
            if(err && err.name === 'TokenExpiredError'){ //토큰 만료
                res.status(419).json({code: 419, message: 'Token expired !'})
            }else if(err){
                res.status(401).json({code: 401, message: 'Invaild Token !'})
            }
            req.user = userInfo //브라우저에서 전송한 사용자의 정보(jwt 토큰)를 복호화해서 req 객체에 저장
            next()
        })
    }
}

//관리자 권한 검증하기 (사용자 검증 후에 위치해야 함)
const isAdmin = (req, res, next)=> { //관리자 확인
    if(req.user && req.user.isAdmin){
        next() // 다음 서비스를 이용할 수 있도록  허용
    }else{
        res.status(401).json({code: 401, message: 'You are not vaild admin user!'})
    }
}

module.exports = { //객체로 만들어서 외부로 내보내기
    generateToken,
    isAuth,
    isAdmin,
}