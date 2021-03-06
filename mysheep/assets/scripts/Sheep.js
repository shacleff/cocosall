var State = cc.Enum({
    None    : -1,
    Run     : -1,
    Jump    : -1,
    Drop    : -1,
    DropEnd : -1,
    Dead    : -1
});
var Dust = require("Dust");
var Sheep = cc.Class({
    extends: cc.Component,

    properties: {
       maxY:0,
       groundY:0,
       gravity:0,
       initJumpSpeed:0,
       _state:{
           default:State.None,
           type:State,
           visible:false
       },
       state:{
           get:function(){
               return this._state;
           },
           set:function(value){
               if(value !== this._state){
                   this._state = value;
                   if(this._state !== State.None){
                       var animName = State[this._state];
                       this.anim.stop();
                       this.anim.play(animName);
                   }
               }
           },
           type:State
       },
       jumpAudio:{
           default:null,
           url:cc.AudioClip
       },
       dustPrefab:cc.Prefab
    },

    statics:{
        State:State
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    init(){
        this.anim = this.getComponent(cc.Animation);
        this.currentSpeed = 0;
        this.sprite = this.getComponent(cc.Sprite);
        this.registerInput();
    },
    startRun(){
        this.state = State.Run;
        this.enableInput(true);
    },
    registerInput(){
        cc.eventManager.addListener({
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode,event){
                this.jump();
            }.bind(this)
        },this.node);

        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan:function(touch,event){
                this.jump();
                return true;
            }.bind(this)
        },this.node);
    },
    enableInput:function(enable){
        if(enable){
            cc.eventManager.resumeTarget(this);
        }else{
            cc.eventManager.pauseTarget(this);
        }
    },

     update (dt) {
         switch(this.state){
             case State.Jump:
                if(this.currentSpeed < 0){
                    this.state = State.Drop;
                }
                break;
            case State.Drop:
                if(this.node.y <this.groupY){
                    this.node.y = this.groundY;
                    this.state = State.DropEnd;
                    this.spawnDust('DustDown');
                }
                break;
            case State.None:
            case State.Dead:
                return;
         }
         var flying = this.state === State.Jump || this.node.y >this.groundY;
         if(flying){
             this.currentSpeed -= dt * this.gravity;
             cc.info("currentSpeed  ",this.currentSpeed);
             this.node.y += dt * this.currentSpeed;
         }
     },
     onDropFinished:function(){
         this.state = State.Run;
     },
     onCollisionEnter:function(other){
         cc.info("onCollisionEnter",other)
        if (this.state !== State.Dead) {
            var group = cc.game.groupList[other.node.groupIndex];
            
            if (group === 'Obstacle') {
                // bump
                this.state = Sheep.State.Dead;
                D.game.gameOver();
                this.enableInput(false);
            }
            else if (group === 'NextPipe') {
                // jump over
                D.game.gainScore();
            }
       }
     },
      //-- 开始跳跃设置状态数据，播放动画
    jump: function () {
        this.state = State.Jump;
        this.currentSpeed = this.initJumpSpeed;
        //-- 播放跳音效
        cc.audioEngine.playEffect(this.jumpAudio);
        this.spawnDust('DustUp');
    },
    spawnDust (animName) {
        let dust = null;
        if (cc.pool.hasObject(Dust)) {
            dust = cc.pool.getFromPool(Dust);
        } else {
            dust = cc.instantiate(this.dustPrefab).getComponent(Dust);
        }
        this.node.parent.addChild(dust.node);
        dust.node.position = this.node.position;
        dust.playAnim(animName);
    }
});
