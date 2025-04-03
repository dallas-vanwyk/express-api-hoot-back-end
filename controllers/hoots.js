// controllers/hoots.js

const express = require('express');
const verifyToken = require('../mIddleware/verify-token');
const Hoot = require('../models/hoot');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        req.body.author = req.user._Id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        res.status(201).json(hoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const hoots = await Hoot.find({})
            .populate('author')
            .sort({ createdAt: "desc" });
        res.status(200).json(hoots);

    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});

router.get('/:hootId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate([
            'author',
            'comments.author',
        ]);

        res.status(200).json(hoot);

    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});

router.put('/:hootId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if (!hoot.author.equals(req.user._Id)) {
            return res.status(403).send('not allowed');
        };

        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            { new: true }
        );

        updatedHoot._doc.author = req.user;

        res.status(200).json(hoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});

router.delete('/:hootId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if (!hoot.author.equals(req.user._Id)) {
            return res.status(403).send('not allowed');
        };

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);

        res.status(200).json(deletedHoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});

router.post('/:hootId/comments', verifyToken, async (req, res) => {
    try {
        req.body.author = req.user._Id;
        const hoot = await Hoot.findById(req.params.hootId);

        if (!hoot) {
            return res.status(400).json({ err: "hoot not found" });
        };

        hoot.comments.push(req.body);
        await hoot.save();

        const newComment = hoot.comments[hoot.comments.length - 1];

        newComment._doc.author = req.user;

        res.status(201).json(newComment);

    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});


router.put('/:hootId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        // if (!hoot) {
        //     return res.status(400).json({ err: "hoot not found" });
        // };

        const comment = hoot.comments.id(req.params.commentId);

        if (comment.author.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: 'not authorized edit' });
        };

        comment.text = req.body.text

        await hoot.save();

        // const newComment = hoot.comments[hoot.comments.length - 1];

        // newComment._doc.author = req.user;

        res.status(201).json({ message: "comment update success" });

    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});


router.delete('/:hootId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        // if (!hoot) {
        //     return res.status(400).json({ err: "hoot not found" });
        // };
        const comment = hoot.comments.id(req.params.commentId);

        if (comment.author.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: 'not authorized delete' });
        };

        hoot.comments.remove({ _id: req.params.commentId });
        await hoot.save();

        res.status(201).json({ message: "delet dis" });

    } catch (err) {
        res.status(500).json({ err: err.message });
    };
});


module.exports = router;