"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./apis/auth.route"));
const ai_route_1 = __importDefault(require("./apis/ai.route"));
// import lessonRoute from './apis/lesson.route';
// import gamificationRoute from './apis/gamification.route';
// import quizRoute from './apis/quiz.route';
const router = (0, express_1.Router)();
router.use('/auth', auth_route_1.default);
router.use('/ai', ai_route_1.default);
// router.use('/lesson', lessonRoute);
// router.use('/gamification', gamificationRoute);
// router.use('/quiz', quizRoute);
exports.default = router;
