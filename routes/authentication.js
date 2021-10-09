const router = require('express').Router()
const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const e = require('express')

router.post('/register', async (req, res) => {
    const registerMail = req.body.email.toString().toLowerCase()
    const registerPassword = req.body.password

    if (
        !registerMail ||
        registerMail === '' ||
        !registerPassword ||
        registerPassword === ''
    ) {
        return res
            .status(403)
            .json({
                errorCode: 'INVALID_CREDENTIALS',
                message: 'Please Provide valid credentials',
            })
    }

    var emailParts = registerMail.split("@");
    var userName = emailParts.length == 2 ? emailParts[0] : null;

    const randomRtcUserId = await getUniqueRtcUserId()
    //console.log(randomRtcUserId);

    try {
        User.findOne({ email: registerMail }, async (error, user) => {
            if (user) {
                return res
                    .status(404)
                    .json({
                        errorCode: 'EMAIL_ALREADY_EXIST',
                        message: 'User Already Exist With this Email Address',
                    })
            } else {
                const newUser = new User({
                    email: registerMail,
                    password: CryptoJS.AES.encrypt(
                        registerPassword,
                        process.env.PASS_AES_SEC_KEY,
                    ),
                    userName: userName,
                    rtcId: randomRtcUserId,
                })

                const savedUser = await newUser.save()

                const accessToken = jwt.sign(
                    {
                        id: savedUser.id,
                    },
                    process.env.JWT_SEC_KEY,
                )

                const { password, ...others } = savedUser._doc
                res.status(201).json({ ...others, accessToken })
            }
        })
    } catch (error) {
        res.status(500).json(err)
    }
})

router.post('/login', (req, res) => {
    console.log(req.body)
    const loginEmail = req.body.email
    const loginPassword = req.body.password

    if (!loginEmail && !loginPassword) {
        res
            .status(403)
            .json({
                errorCode: 'INVALID_CREDENTIALS',
                message: 'Please Provide valid credentials',
            })
    }

    try {
        User.findOne({ email: loginEmail }, (err, user) => {
            if (!user) {
                return res
                    .status(403)
                    .json({
                        errorCode: 'INVALID_EMAIL',
                        message: 'Invalid Email Address',
                    })
            }

            const hashedPassword = CryptoJS.AES.decrypt(
                user.password,
                process.env.PASS_AES_SEC_KEY,
            )
            const dbPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

            if (loginPassword !== dbPassword) {
                res
                    .status(403)
                    .json({ errorCode: 'INVALID_PASSWORD', message: 'Invalid Password' })
            }

            const accessToken = jwt.sign(
                {
                    id: user.id,
                },
                process.env.JWT_SEC_KEY,
            )

            const { password, ...others } = user._doc
            res.status(201).json({ ...others, accessToken })
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

const getUniqueRtcUserId = async () => {
    const randomRtcUserId = between(200000, 9900000)
    console.log(randomRtcUserId);
    try {
        var user = await User.findOne({ rtcId: randomRtcUserId })
        console.log(user._doc);
        await getUniqueRtcUserId()
    } catch (error) {
        return randomRtcUserId
    }
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

module.exports = router
