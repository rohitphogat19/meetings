const User = require('../models/User')
const File = require("../models/FileSchema");
const { verifyToken, verifyTokenAndAuthorization } = require('./verifyJWT')

const router = require('express').Router()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split("/")[1];
        cb(null, `/admin-${file.fieldname}-${Date.now()}.${ext}`);
    }
});

const uploadImg = multer({ storage: storage }).single('image');

router.put(
    '/:id/updateProfile',
    verifyTokenAndAuthorization,
    async (req, res) => {
        req.body.isProfileSet = true;
        try {
            const updatingUser = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true, },
            );
            const { password, ...others } = updatingUser._doc
            res.status(201).json(others)
        } catch (error) {
            res.status(500).json(error)
        }
    },
)

router.post("/updateprofileImage", verifyToken, uploadImg, async (req, res) => {
    try {
        const newFile = await File.create({
            name: req.file.filename,
        });
        res.status(200).json({
            status: "success",
            message: "File created successfully!!",
            file: newFile._doc
        });
    } catch (error) {
        res.json({
            error,
        });
    }
})

module.exports = router
