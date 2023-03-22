//ควบคุมการทำงานของ auth

const User = require('../models/User')

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const {name, email, password, role} = req.body;
        //Create user จาก user model นำข้อมูลของ user save ลง DB
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        //Create Token
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success: true, token})
        sendTokenResponse(user, 200, res);

    } catch(err) {
        res.status(400).json({success: false});
        console.log(err.stack);
    }
};

//@desc     Login user
//@route    POST /api/vi/auth/login
//@access Public
exports.login = async (req, res, next) => {
    const {email, password} = req.body;
    //Validate email & password
    // ถ้าเป็นค่าว่างให้ส่ง res กลับไปว่าไม่มี email & password
    if(!email || !password) {
        return res.status(400).json({success: false,
        msg: 'Please provide an email and passeord'});
    }

    //Check for user
    const user = await
    User.findOne({email}).select('+password');

    //ถ้าไม่เจอ user ให้ส่ง error กลับไป
    if(!user) {
        return res.status(400).json({success: false,
        msg: 'Invalis credentials'});
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password);

    //ถ้าไม่ match ก็ส่งกลับไปว่า Invalid
    if(!isMatch) {
        return res.status(401).json({success: false,
        msg: 'Invalid credentials'});
    }

    //เจอแล้วว่าใช่ให้ create token
    //Create token
    // const token = user.getSignedJwtToken();
    // res.status(200).json({success: true, token});
    sendTokenResponse(user, 200, res);
};


//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create Token
    const token = user.getSignedJwtToken();

    //Expire วันนี้แต่+เพิ่มตาม jwt cookie expire ที่เราเซ็ตไว้และเปลี่ยนเป็น ms
    const options = {
        exptres: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV == 'production'){
        options.secure = true;
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}


//At the end of file
//@desc     Get current Logged in user
//@route    POST /api/vi/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
}