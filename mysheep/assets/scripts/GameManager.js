var Sheep = require("Sheep");
var Scroller = require("Scroller");
var State = cc.Enum({
    Menu: -1,
    Run: -1,
    Over: -1
});
var GameManager =cc.Class({
    extends: cc.Component,

    properties: {
       sheep:Sheep,
       gameOverMenu:cc.Node,
       scoreText:cc.Label,
       gameBgAudio:{
           default:null,
           url:cc.AudioClip
       },
       dieAudio:{
           default:null,
           url:cc.AudioClip
       },
       gameOverAudio:{
           default:null,
           url:cc.AudioClip
       },
       scoreAudio:{
           default:null,
           url:cc.AudioClip
       }
    },
    statics:{
        State:State
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        D.GameManager = GameManager;
        D.game = this;

        cc.director.getCollisionManager().enabled = true;
        this.state = State.Menu;
        //分数
        this.score = 0;
        this.scoreText.string = this.score;
        this.gameOverMenu.active = false;
        this.sheep.init();
    },

    start () {
        this.state = State.Run;
        this.score = 0;
        D.pipeManager.startSpawn();
        this.sheep.startRun();
    },
    gameOver (){
        cc.audioEngine.stopMusic(this.gameBgAudio);
        cc.audioEngine.playEffect(this.dieAudio);
        cc.audioEngine.playEffect(this.gameOverAudio);
        D.pipeManager.reset();
        this.state = State.Over;
        this.gameOverMenu.active = true;
        this.gameOverMenu.getComponent('GameOverMenu').score.string = this.score;
    },
    gainScore (){
        this.score++;
        this.scoreText.string = this.score;
        cc.info("this.score  = ",this.score);
        cc.audioEngine.playEffect(this.scoreAudio);
    },
    // update (dt) {},
});
