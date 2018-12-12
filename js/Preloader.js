
var boomRocket = {};
var hueValue = 0;
var score = 0;
var rotationSpeed = config.rotationSpeed;
var isJumping = true;

boomRocket.Preloader = function(game) {
    this.game = game;
};

boomRocket.Preloader.prototype = {
    
    preload: function() {
        this.load.bitmapFont('font', 'assets/font.png', 'assets/font.xml');
        this.load.image('arrow','assets/arrows.png');
        this.load.image('circle','assets/Circle.png');
        this.load.image('rocket','assets/Rocket.png');
        this.load.image('square','assets/Square.png');  
        this.load.image('spike','assets/spike.png');  
		this.load.image('blackBG','assets/blackBackground.png');
		this.load.image('whiteBG','assets/restartScreen.png');
		this.load.image('blackC','assets/blackCircle.png');
		this.load.image('redC','assets/redCircle.png');
		this.load.image('yellowC','assets/yellowCircle.png');
        this.load.spritesheet('item','assets/item.png',32,32);  
    },

    create: function() {
        var fireSmoke = this.game.add.bitmapData(3, 3);
        fireSmoke.ctx.fillStyle = 'rgba(255,211,0,1)';
        fireSmoke.ctx.rect(0,0,3,3);
        fireSmoke.ctx.fill();
        this.game.cache.addBitmapData('yellow', fireSmoke);

        var smoke = this.game.add.bitmapData(4, 4);
        smoke.ctx.rect(0,0,4,4);
        smoke.ctx.fill();
        this.game.cache.addBitmapData('black', smoke);

        var white = this.game.add.bitmapData(4, 4);
        white.ctx.fillStyle = 'white';
        white.ctx.rect(0,0,4,4);
        white.ctx.fill();
        this.game.cache.addBitmapData('white', white);

        var redSmoke = this.game.add.bitmapData(3, 3);
        redSmoke.ctx.rect(0,0,4,4);
        redSmoke.ctx.fillStyle = 'red';
        redSmoke.ctx.fill();
        this.game.cache.addBitmapData('red', redSmoke);

        this.game.flexcale = this.game.plugins.add(Phaser.Plugin.Flexcale);
        this.game.flexcale.setOptions({
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            resolution: 1,
        });
    },

    loadUpdate: function() {
        playsiveSDK.loadingProgressUpdate(this.load.progress);
    },

    update: function() {
        this.state.start('Game');
    }
};