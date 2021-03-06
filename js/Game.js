boomRocket.Game = function(game) {
  this.game = game;
  shipTween = null;
  this.gameOverBG;
  this.isPowerUp = false;
  this.restartBlock = null;
  this.restartText = null;
  this.restartTimer = null;
  this.firstStart = true;
  this.isAffected = false;
  this.cameraTimer = null;
};

boomRocket.Game.prototype = {
    
    init: function(){
        playsiveSDK.gameLoaded();
        this.game.time.desiredFps = config.desiredFPS;
    },
	
    restart: function(){
		this.game.camera.follow(this.player,null,1,1,0,0);
		this.restartBG.alpha = 1;
		//Reset Shapes and Particles
		this.items.exists = true;
		//Particles
		this.playerDeath.exists = true;
		this.playerDeath2.exists = true;
		this.playerDeath.visible = false;
		this.playerDeath2.visible = false;
		this.shipTrail.removeAll(true);
		this.shipTrail.makeParticles(this.game.cache.getBitmapData('white'), 0, 50, true, false);
		this.shipTrail.exists = true;
		this.add.tween(this.restartBG).to({alpha:0},300,Phaser.Easing.Linear.None,true,0,0,false);
        score = 0;
        isJumping = true;
        this.gameOver = false;
        this.isStart = false;
        this.scoreText.text = 0;
        this.player.reset(config.minWidth*0.5,config.minHeight*0.8);
        this.player.body.allowGravity = false;
        this.player.angle = 0;
        this.player.shield = false;
        this.shipTrail.emitX = this.player.x;
        this.shipTrail.emitY = this.player.y + 25;
        this.fireEngine.emitX = this.player.x;
        this.fireEngine.emitY = this.player.y + 20;
		
        this.game.camera.focusOn(this.player);
        this.jumpTrail.revive();
        this.circle.revive();
        this.circle1.revive();
        this.circle2.revive();
        this.tapText.revive();
		this.best.alpha = 0.3;
		this.bestScore.alpha = 0.3;
        this.scoreText.alpha = 0.3;
		this.gameOverBG.alpha = 0;
        this.restartObstacles();
		if(this.restartTimer){
			this.game.time.events.remove(this.restartTimer);
		}
		if(config.restartButton){
			this.restartBlock.input.enabled = false;
			//this.restartBlock.x = this.game.width*0.5;
			//this.restartBlock.y = this.game.height*0.8;
			//this.restartBlock.scale = 0;
			this.restartBlock.alpha = 0;
			this.restartBlock.anchor.setTo(.5)
		}
        this.game.input.onDown.remove(this.engineOn, this);
        this.game.input.onDown.add(this.start, this); 
    },  

    destroyPlayer: function(){
        this.gameOver = true;
        this.player.kill();
        this.jumpTrail.kill();
        this.game.time.events.add(750,this.sendScore,this);
    },

    sendScore: function(){
        playsiveSDK.postScore(score);
		if(config.restartButton){
			this.game.add.tween(this.restartBlock).to({alpha:1},300,Phaser.Easing.Linear.None, true,50,0,false);
			this.game.time.events.add(400,function(){
				this.restartBlock.input.enabled = true;
			},this);
		}
		//Pause particles and shapes
		//Rectangles
		this.squareObstacles.forEach(function(square){
			square.speed = 0;
		});
		//Circles
		this.circleObstacles.forEach(function(circle){
			circle.speed = 0;
		});
		//Items
		this.items.forEach(function(item){
			item.speed = 0;
		});
		this.items.exists = false;
		this.items.visible = true;
		//Particles
		this.playerDeath.exists = false;
		this.playerDeath.visible = true;
		this.playerDeath2.exists = false;
		this.playerDeath.visible = true;
		this.shipTrail.exists = false;
		this.shipTrail.visible = true;
		
		this.game.add.tween(this.gameOverBG).to({alpha:0.6},400,Phaser.Easing.Linear.None,true,0,0,false);
		this.game.add.tween(this.best).to({alpha:1},400,Phaser.Easing.Linear.None,true,0,0,false);
		this.game.add.tween(this.bestScore).to({alpha:1},400,Phaser.Easing.Linear.None,true,0,0,false);
		this.game.add.tween(this.scoreText).to({alpha:1},400,Phaser.Easing.Linear.None,true,0,0,false);
        this.restartTimer = this.game.time.events.add(config.restartDelay,this.restart,this);
		//this.game.time.events.add(1000,this.gameOver);
    },

    explode: function(){
		this.game.camera.unfollow();
		this.game.camera.lerp.x = 1;
		this.game.camera.lerp.y = 1;
        this.playerDeath.emitX = this.player.x;
        this.playerDeath.emitY = this.player.y;
        this.playerDeath2.emitX = this.player.x;
        this.playerDeath2.emitY = this.player.y;
        this.circle1.x = this.player.x;
        this.circle1.y = this.player.y;
        this.circle2.x = this.player.x;
        this.circle2.y = this.player.y;
        this.circle1.alpha = 0.3;
        this.circle2.alpha = 0.3;
        this.circle1.effectDot.start();
        this.circle1.effectDot2.start(); 
        this.circle2.effectDot.start(); 
        this.circle2.effectDot2.start();
		this.playerDeath.forEach(function(particle){
			base1 = "ff";
			base2 = Math.floor(Math.random()*216).toString(16);
			while (base2.length< 2) {base2 = "0" + base2;}
			base3 = "00";
			colorStr = base1 + base2 + base3;
			randomColor = parseInt(colorStr,16);
			particle.tint = randomColor;
		});
		this.playerDeath.visible = true;
		this.playerDeath2.visible = true;
        this.playerDeath.flow(3000, 250, 50, 50,true);
        this.playerDeath2.flow(3000, 250, 50, 50,true);
    },

    createRectangles: function(){
        this.squareObstacles = this.game.add.group();
        this.squareObstacles.enableBody = true;
        this.game.physics.enable(this.squareObstacles, Phaser.Physics.ARCADE);
        this.squareObstacles.createMultiple(config.rectangles, 'square');

        this.squareObstacles.forEach(function(square){
            var randomSize = this.game.rnd.realInRange(0.2,0.8);
            square.scale.set(square.scale.x * randomSize, square.scale.y * randomSize * 2);
        },this);
        
    },

    createAreaEffect: function(){
		this.areaGroup = this.game.add.group();
		this.areaGroup.enableBody = true;
		this.game.physics.enable(this.areaGroup,Phaser.Physics.ARCADE);
		this.areaGroup.createMultiple(config.areas, 'arrow');
		
		this.areaGroup.forEach(function(effect){
			effect.scale.set(0.7,0.7);
			effect.alpha = 0.3;
			
			//effect.body.setCircle(effect.width, (-(effect.width) + 0.5 * effect.width  / effect.scale.x),(-(effect.width) + 0.5 * effect.height / effect.scale.y));
		});
		
		
        /*this.areaEffect = this.game.add.sprite(0, 0, 'arrow');
        this.areaEffect.anchor.set(0.5);
		this.areaEffect.scale.setTo(0.6);
        this.game.physics.enable(this.areaEffect, Phaser.Physics.ARCADE);
        this.areaEffect.alpha = 0.3;
        this.areaEffect.angle = this.game.rnd.between(0,360);
        this.areaEffect.body.setCircle(this.areaEffect.width, (-(this.areaEffect.width) + 0.5 * this.areaEffect.width  / this.areaEffect.scale.x),(-(this.areaEffect.width) + 0.5 * this.areaEffect.height / this.areaEffect.scale.y));
        this.areaEffect.x = this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width);
        this.areaEffect.y = this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3);*/
    },
	
    createItems: function(){
        this.items = this.game.add.group();
        this.items.enableBody = true;
        this.game.physics.enable(this.items, Phaser.Physics.ARCADE);
        this.items.createMultiple(config.items, 'item');  
    },

    createCircles: function(){
        this.circleObstacles = this.game.add.group();
        this.circleObstacles.enableBody = true;
        this.game.physics.enable(this.circleObstacles, Phaser.Physics.ARCADE);
        this.circleObstacles.createMultiple(config.spikes, 'spike');

        this.circleObstacles.forEach(function(circle){
            var randomSize = this.game.rnd.realInRange(0.07,0.25);
            circle.scale.set(circle.scale.x * randomSize, circle.scale.y * randomSize);
        },this);
        
    },

    addRectangles: function(){
		this.border1 = this.game.add.sprite((this.game.width*0.5-this.game.world.width*0.31)-40,this.game.height*0.5,'border');
		this.border2 = this.game.add.sprite((this.game.width*0.5+this.game.world.width*0.150)+40,this.game.height*0.5,'border');
		
		this.border1.anchor.setTo(0.5,0.5);
		this.border1.scale.setTo(3,1)
		this.border1.zIndex = 999;
		
		this.border2.anchor.setTo(0.5,0.5);
		this.border2.scale.setTo(3,1)
		this.border2.zIndex = 999;
		
		this.border1.enableBody = true;
		this.border2.enableBody = true;
		
		this.game.physics.enable(this.border1, Phaser.Physics.ARCADE);
		this.border1.body.immovable = true;
		//this.border1.body.setSize(this.border1.width);
		this.game.physics.enable(this.border2, Phaser.Physics.ARCADE);
		this.border2.body.immovable = true;
		//this.border2.body.setSize(this.border2.width*1.5);
		
        var square = this.squareObstacles.getFirstDead();
        square.anchor.set(0.5);
        square.speed = this.game.rnd.between(-35,35);
        square.body.immovable = true;
        square.angle = this.game.rnd.between(0,90);
        square.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3));
        square.body.setCircle(square.width*1.5, (-(square.width*1.5) + 0.5 * square.width  / square.scale.x),(-(square.width*1.5) + 0.5 * square.height / square.scale.y));
    },

    addCircles: function(){
        var circle = this.circleObstacles.getFirstDead();
        circle.anchor.set(0.5);
        circle.speed = this.game.rnd.between(-25,25);
        circle.body.immovable = true;
        circle.body.allowGravity = false;

        circle.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.3,this.player.y-this.game.height*0.8));
        
        if(this.game.device.desktop)
            var radius = circle.width*0.45;
        else
            var radius = circle.width*0.95;

        circle.body.setCircle(radius, (-radius + 0.5 * circle.width  / circle.scale.x),(-radius + 0.5 * circle.height / circle.scale.y));
    },
	
	addAreaEffect: function(){
		var arEff = this.areaGroup.getFirstDead();
        arEff.anchor.set(0.5);
		arEff.body.immovable = true;
		arEff.angle = this.game.rnd.between(0,360);
        arEff.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.3,this.player.y-this.game.height*0.8));

        arEff.body.setCircle(arEff.width, (-(arEff.width) + 0.5 * arEff.width  / arEff.scale.x),(-(arEff.width) + 0.5 * arEff.height / arEff.scale.y));
	},

    addItems: function(){
        var item = this.items.getFirstDead();
        var dot = this.game.add.sprite(0, 0, 'circle');
        dot.anchor.set(0.5);
        dot.scale.set(0.2);
        dot.alpha = 0.4;
        item.anchor.set(0.5);
        item.speed = this.game.rnd.between(10, 25);
        item.animations.add('blink',[1,2,3,4],6,true);
        item.animations.play('blink');       
        item.effectDot = this.game.add.tween(dot).to( { alpha: 0 }, 800, Phaser.Easing.Sinusoidal.Out, true, 0, -1, true);
        item.effectDot2 = this.game.add.tween(dot.scale).to( {x:0.4,y:0.4 }, 800, Phaser.Easing.Quadratic.Out, true, 0, -1,true);
        item.addChild(dot);
        item.body.immovable = true;
        item.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3));
        var radius = item.width;
        item.body.setCircle(radius, (-radius + 0.5 * item.width  / item.scale.x),(-radius + 0.5 * item.height / item.scale.y));
    },

    makeObstacles: function(){
        for(var i = 0; i<this.squareObstacles.children.length; i++){
            this.addRectangles();
        }

        for(var i = 0; i<this.circleObstacles.children.length; i++){
            this.addCircles();
        }
		
		for(var i = 0; i<this.areaGroup.children.length; i++){
            this.addAreaEffect();
        }

        for(var i = 0; i<this.items.children.length; i++){
            this.addItems();
        }
    },

    restartObstacles: function(){
        this.squareObstacles.forEach(function(square){
          square.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3));
		  square.speed = this.game.rnd.between(-35,35);
        },this);

        this.circleObstacles.forEach(function(circle){
          circle.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.3,this.player.y-this.game.height*0.8));
		  circle.speed = this.game.rnd.between(-25,25);
        },this);

        this.items.forEach(function(item){
          item.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3));
		  item.speed = this.game.rnd.between(10, 25);
        },this);

        //this.areaEffect.x = this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width);
        //this.areaEffect.y = this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3);
        //this.areaEffect.angle = this.game.rnd.between(0,360);
		
		this.areaGroup.forEach(function(effect){
          effect.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3));
        },this);
    },

    create: function() {
		//manager = this.game.plugins.add(Phaser.ParticleStorm);
        this.gameOver = false;
        this.isStart = false;
        this.changeBgColor();
        this.game.world.setBounds(0,0,this.game.width*3,45000);

        this.graphics = this.game.add.graphics(0, 0);
        this.graphics.beginFill(this.stage.backgroundColor);
        this.graphics.drawRect(0, 0, config.minWidth, config.minHeight);
        this.graphics.endFill();

        this.createRectangles();
        this.createCircles();
        this.createItems();
        this.createStartUi();
		
        this.createScore();
        this.createPlayer();
        this.createAreaEffect();
        this.makeObstacles();

        this.game.input.onDown.add(this.start, this); 

        this.graphics.addChild(this.circle);
        this.graphics.addChild(this.tapText);
        this.graphics.addChild(this.player);
        //this.graphics.addChild(this.areaEffect);
		this.graphics.addChild(this.areaGroup);
        this.graphics.addChild(this.fireEngine);
        this.graphics.addChild(this.shipTrail);
		this.graphics.addChild(this.shieldTrail);
        this.graphics.addChild(this.squareObstacles);
		this.graphics.addChild(this.areaGroup);
        this.graphics.addChild(this.circleObstacles);
        this.graphics.addChild(this.items);
        this.graphics.addChild(this.specialPower);
        this.graphics.addChild(this.circle1);
        this.graphics.addChild(this.circle2);
		this.graphics.addChild(this.circle3);
        this.graphics.addChild(this.playerDeath);
        this.graphics.addChild(this.playerDeath2);
		this.graphics.addChild(this.border1);
		this.graphics.addChild(this.border2);

        this.game.flexcale.onResize.add(function (scale) {
           this.graphics.scale.set(scale);
           this.scoreText.scale.set(scale);
           this.graphics.alignIn(this.game.world, Phaser.CENTER);
        },this);

        this.game.flexcale.resize();
        this.graphics.y = this.game.world.height-this.graphics.height;
		
		if(this.firstStart){
			this.restartBG.alpha = 1;
			this.add.tween(this.restartBG).to({alpha:0},300,Phaser.Easing.Linear.None,true,0,0,false);
			this.firstStart = false;
		}
		
    },

    start: function(){
		
        //this.circle.kill();
        this.tapText.kill();
        isJumping = false;
        this.isStart = true;
        this.player.body.drag.set(50);
        this.player.body.gravity.y = 60;
        this.player.body.allowGravity = true;
        this.engineOn();
		this.game.camera.lerp.x = 0.6;
		this.game.camera.lerp.y = 0.6;
        this.game.input.onDown.remove(this.start, this);
        this.game.input.onDown.add(this.engineOn, this); 
    },

    createStartUi: function(){
        this.circle = this.game.add.sprite(config.minWidth*0.5, config.minHeight*0.8, 'circle');
        this.circle.scale.set(0.4);
        this.circle.anchor.set(0.5);
        this.circle.alpha = 0.3;

        this.specialPower = this.game.add.emitter(0, 0,200);
        this.specialPower.width = this.game.width;
        this.specialPower.setScale(0.2, 0.3, 15, 40);
        this.specialPower.setAlpha(0.01, 0.8);
        this.specialPower.setYSpeed(-3500, -4800);
        this.specialPower.setRotation(0,0);
        this.specialPower.makeParticles([this.game.cache.getBitmapData('black'),this.game.cache.getBitmapData('white')],200);
        this.tapText = this.game.add.bitmapText(config.minWidth*0.5, config.minHeight*0.7,'font', config.startText);
        this.tapText.anchor.set(0.5);
        this.tapText.alpha = 0.3;
        this.tapTextTween = this.game.add.tween(this.tapText).to({y:this.tapText.y-this.tapText.height*0.25}, 1000, Phaser.Easing.Quadratic.InOut,true,0,-1,true);
    },

    createPlayer: function(){
		this.player = this.game.add.sprite(config.minWidth*0.5, config.minHeight*0.8, 'rocket');
        this.player.anchor.set(0.5);
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.body.maxVelocity.set(1500);
        this.player.shield = false;
		
		this.shieldTrail = this.game.add.emitter(this.player.x, this.player.y,30);
		this.shieldTrail.setScale(1, 2, 1, 2, 700, Phaser.Easing.Quadratic.Out);
        this.shieldTrail.setAlpha(0.01, 0.8, 700 ,Phaser.Easing.Linear.InOut);
        this.shieldTrail.setXSpeed(-60, 60);
        this.shieldTrail.setYSpeed(-60, 0);
		this.shieldTrail.setRotation(0,360);
        this.shieldTrail.makeParticles(this.game.cache.getBitmapData('white'),30);
        this.shieldTrail.flow(300, 10, 1, -1, false);
		this.shieldTrail.visible = false;

        this.game.camera.follow(this.player,null,1,1,0,300);
		////this.game.camera.follow(this.player,Phaser.Camera.FOLLOW_LOCKON,1,0.1,0,400);
        this.game.camera.focusOn(this.player);
        //this.game.camera.deadzone = new Phaser.Rectangle(this.game.width*0.425, this.game.height*0.6*(3/4), this.game.width*0.05, this.game.height*0.35*(4/3));
		this.game.camera.deadzone = new Phaser.Rectangle(this.game.width*0.425, this.game.height*0.6*(5/6), this.game.width*0.05, this.game.height*0.35*(6/5));
        this.player.body.onWorldBounds = new Phaser.Signal()
        this.player.body.onWorldBounds.add(this.destroyPlayer, this);
        this.player.events.onKilled.add(this.explode,this);

        this.ground = this.game.add.sprite(this.game.width*0.5, 0, 'square');
        this.ground.width = this.game.width;
        this.ground.anchor.set(0.5);
        this.ground.alpha = 0;
        this.ground.y = this.game.camera.deadzone.bottom+this.ground.height+this.game.height*0.1;
        this.game.physics.enable(this.ground, Phaser.Physics.ARCADE);
        this.ground.body.allowGravity = false;
        this.ground.body.inmovable = true;
        this.ground.fixedToCamera = true;

        this.shipTrail = this.game.add.emitter(this.player.x, this.player.y + 20,45);
        this.shipTrail.setScale(1, 5, 1, 5, 1500, Phaser.Easing.Quadratic.Out);
        this.shipTrail.setAlpha(0.01, 0.4, 3000 ,Phaser.Easing.Linear.InOut);
        this.shipTrail.setXSpeed(-50, 50);
        this.shipTrail.setYSpeed(-10, 40);
        this.shipTrail.makeParticles(this.game.cache.getBitmapData('white'),45);
        this.shipTrail.flow(600, 10, 1, -1, false);
        
		this.fireEngine = this.game.add.emitter(this.player.x, this.player.y + 15,120);
        this.fireEngine.setScale(1, 1, 1, 1);
        this.fireEngine.setAlpha(0.01, 0.3);
        this.fireEngine.setXSpeed(-10, 10);
        this.fireEngine.setYSpeed(-5, -5);
		this.fireEngine.makeParticles([this.game.cache.getBitmapData('red'),this.game.cache.getBitmapData('yellow')],120);
        this.fireEngine.flow(300, 50, 3, -1,false);
        
		
		this.circle2 = this.game.add.sprite(0, 0, 'circle');
        this.circle2.scale.set(0);
        this.circle2.anchor.set(0.5);
        this.circle2.alpha = 0;
        this.circle1 = this.game.add.sprite(0, 0, 'circle');
        this.circle1.scale.set(0);
        this.circle1.anchor.set(0.5);
        this.circle1.alpha = 0;
		this.circle1.tint = 0xffff00;
		this.circle3 = this.game.add.sprite(0, 0, 'circle');
        this.circle3.scale.set(0.5);
        this.circle3.anchor.set(0.5);
        this.circle3.alpha = 0;
		
        this.circle1.effectDot = this.game.add.tween(this.circle1).to( { alpha: 0.05 }, 400, Phaser.Easing.Sinusoidal.Out, false);
        this.circle1.effectDot2 = this.game.add.tween(this.circle1.scale).to( {x:1,y:1}, 400, Phaser.Easing.Quadratic.Out, false);
        this.circle2.effectDot = this.game.add.tween(this.circle2).to( { alpha: 0.05 }, 600, Phaser.Easing.Sinusoidal.Out, false);
        this.circle2.effectDot2 = this.game.add.tween(this.circle2.scale).to( {x:2,y:2}, 600, Phaser.Easing.Quadratic.Out, false);
		
        this.circle1.effectDot2.onComplete.add(function(){this.circle1.kill();this.circle1.scale.set(0);this.circle1.alpha = 0;},this);
        this.circle2.effectDot2.onComplete.add(function(){this.circle2.kill();this.circle2.scale.set(0);this.circle2.alpha = 0;},this);
		

        this.playerDeath = this.game.add.emitter(this.player.x,  this.player.y,25);
        this.playerDeath.setAlpha(0.1, 0.6, 800);
        this.playerDeath.setXSpeed(-200, 200);
        this.playerDeath.setYSpeed(-200, 200);
        this.playerDeath.setRotation(0,360);
        this.playerDeath.setScale(1, 5, 1, 5, 1500, Phaser.Easing.Quintic.Out);
		this.playerDeath.bounce.setTo(1,1);
		this.playerDeath.makeParticles(this.game.cache.getBitmapData('white'), 0, 25, true, false);

        this.playerDeath2 = this.game.add.emitter(this.player.x,  this.player.y,20);
        this.playerDeath2.setAlpha(0.2, 0.3, 800);
        this.playerDeath2.setXSpeed(-225, 225);
        this.playerDeath2.setYSpeed(-225, 225);
        this.playerDeath2.setRotation(0,360);
		this.playerDeath2.bounce.setTo(1,1);
        this.playerDeath2.setScale(6, 8, 6, 8, 1500, Phaser.Easing.Quintic.Out);
        this.playerDeath2.makeParticles(this.game.cache.getBitmapData('black'), 0, 20, true, false);

		this.playerDeath.visible = false;
		this.playerDeath2.visible = false;
		
        this.jumpTrail = this.game.add.emitter(0, 20,60);
        this.jumpTrail.setScale(6, 12, 6, 12, 800, Phaser.Easing.Quintic.Out);
        this.jumpTrail.setAlpha(0.01, 0.5);
        this.jumpTrail.setXSpeed(-20, 20);
        this.jumpTrail.setYSpeed(10, 800);
        this.jumpTrail.makeParticles([this.game.cache.getBitmapData('yellow'),this.game.cache.getBitmapData('red')],60);
		this.jumpTrail.flow(3200, 10, 1, -1, false);
    },
     
    createScore: function() {
		this.gameOverBG = this.game.add.sprite(0, 0, 'blackBG');
		this.gameOverBG.alpha = 0;
        this.gameOverBG.fixedToCamera = true;
		
		if(config.restartButton){
			this.restartBlock = this.add.sprite(this.game.width*0.5, this.game.height*0.7, 'restartBlock');
			
			this.restartBlock.scale.setTo(0.5,0.5);
			this.restartBlock.anchor.set(0.5);
			
			this.restartBlock.inputEnabled = true;
			this.restartBlock.events.onInputDown.add(this.restart,this);
			this.restartBlock.fixedToCamera = true;
			this.restartBlock.alpha = 0;
			this.restartBlock.input.enabled = false;
		}
		
		this.best = this.game.add.bitmapText(this.game.width*0.5, this.game.height*0.12,'font', '0',60);
		this.best.anchor.set(0.5);
		this.best.text = "BEST";
		this.best.alpha = 0.3;
        this.best.fixedToCamera = true;
		this.bestScore = this.game.add.bitmapText(this.game.width*0.5, this.game.height*0.17,'font', '0',100);
		this.bestScore.anchor.set(0.5);
		this.bestScore.text = 0;
		this.bestScore.alpha = 0.3;
        this.bestScore.fixedToCamera = true;
        this.scoreText = this.game.add.bitmapText(this.game.width*0.5, this.game.height*0.5,'font', '0',200);
        this.scoreText.anchor.set(0.5);
        this.scoreText.alpha = 0.3;
        this.scoreText.fixedToCamera = true;
		this.restartBG = this.game.add.sprite(0, 0, 'whiteBG');
		this.restartBG.alpha = 0;
        this.restartBG.fixedToCamera = true;
    },

    engineOn: function(){
		if(this.gameOver||this.isPowerUp) return;
		
		this.fireEngine.setScale(1,4,1,4);
		this.fireEngine.setXSpeed(-80,80);
		this.fireEngine.setYSpeed(3,3);
		this.fireEngine.setRotation(0,30);
		this.fireEngine.flow(150, 10, 10, -1,true);
		
		this.shipTrail.lifespan = 1200;
		this.shipTrail.setXSpeed(-25,25);
		this.shipTrail.setYSpeed(-5,60);
		if(shipTween){
			shipTween.stop();
		}else{
			shipTween = this.game.add.tween(this.shipTrail).to({lifespan:600},400,Phaser.Easing.Sinusoidal.InOut,true,0,0,false);
		}

        isJumping = true;
        this.isPowerUp = false;
        //this.jumpTrail.flow(200, 250, 20, 20,false);
		this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
		this.jumpTrail.start(false, 400, 80, 15);
        this.acceleratePlayer(config.normalJump,600);
		this.game.camera.follow(null);
		this.game.camera.follow(this.player,null,0.7,0.7,0,-350);
		this.game.camera.deadzone = new Phaser.Rectangle(this.game.width*0.5,this.game.height*0.55,this.game.width*0.3,this.game.height*0.15);
		moveTween = this.game.add.tween(this.game.camera).to({lerpX:0.05,lerpY:0.05},400,Phaser.Easing.Sinusoidal.InOut,true,0,0,false);
     },

    engineOff: function(){
		this.fireEngine.setScale(1,1,1,1);
		this.fireEngine.setXSpeed(-10,10);
		this.fireEngine.setYSpeed(-5,-5);
		this.fireEngine.flow(300, 50, 3, -1,false);
		
		this.shipTrail.lifespan = 600;
		this.shipTrail.setXSpeed(-50,50);
		this.shipTrail.setYSpeed(-10,40);
		
		this.player.body.maxVelocity.set(1500);
        isJumping = false;
		this.isPowerUp = false;
		this.player.body.allowGravity = true;
		this.player.body.gravity.y = 60;
		this.game.time.events.add(1000,function(){
			this.player.shield = false;
			if(!this.isPowerUp){
				this.circle3.alpha = 0;
				this.shieldTrail.visible = false;
			}
		},this);
	},

    acceleratePlayer: function(power,duration){
          //this.player.body.acceleration.set(Math.cos(this.player.rotation  - (Math.PI / 2)) * -.01,this.player.body.velocity.y = Math.sin(this.player.rotation  - (Math.PI / 2)) * -.01);
		  this.player.body.acceleration.set(0,0);
		  this.player.body.allowGravity = false;
          //this.player.body.velocity.x = Math.cos(this.player.rotation  - (Math.PI / 2)) * power;
          //this.player.body.velocity.y = Math.sin(this.player.rotation  - (Math.PI / 2)) * power;
		this.game.physics.arcade.velocityFromAngle(this.player.angle-90,1,this.player.body.velocity);
		this.player.body.velocity.x = this.player.body.velocity.x * power;
		this.player.body.velocity.y = this.player.body.velocity.y * power;
          this.game.time.events.add(duration,this.engineOff,this);
     },

	deceleratePlayer: function(){
		if(isJumping || (this.player.body.speed > 0.03 && this.player.body.velocity.y < 0)){
			this.player.body.velocity.x = this.player.body.velocity.x * 0.93;
			this.player.body.velocity.y = this.player.body.velocity.y * 0.93;
		}else if(this.player.body.velocity.y < 0){
			this.player.body.velocity.x = 0;
			//this.player.body.velocity.y = 0;
		}
		if(!this.isAffected && !isJumping){
			this.player.body.velocity.x = this.player.body.velocity.x * 0.93;
		}
	},
	 
    activatePower: function(player, item){
		 this.player.body.maxVelocity.set(10000);
		 this.isPowerUp = true;
          isJumping = true;
          this.game.time.events.removeAll();
          item.kill();
		  this.player.body.velocity.x = 0;
		  this.player.body.velocity.y = 0;
          this.player.shield = true;
		  this.player.angle = 0;
		  this.acceleratePlayer(config.specialJump,1000);
		  if(this.circle3.effectDot){
			  this.circle3.effectDot.stop();
		  }
		  if(this.circle3.effectDot2){
			  this.circle3.effectDot2.stop();
		  }
		  this.circle3.effectDot = this.game.add.tween(this.circle3).to( { alpha: 0.5 }, 600, Phaser.Easing.Sinusoidal.Out, false);
		  this.circle3.effectDot2 = this.game.add.tween(this.circle3.scale).to( {x:0.45,y:0.45}, 150, Phaser.Easing.Sinusoidal.InOut, false,0,-1,true);
		  this.shieldTrail.visible = true;
		  this.circle3.effectDot.start();
		  this.circle3.effectDot2.start();
          this.specialPower.emitX = this.player.x;
          this.specialPower.emitY = this.player.y-this.game.height*0.3;
          //this.jumpTrail.flow(200, 250, 20, 20,false);
		  this.jumpTrail.flow(3200, 10, 1, -1, false);
		  //this.jumpTrail.start(false, 100, 80, 30);
          this.specialPower.flow(800, 10, 10, 150,true);
		  //this.specialPower.flow(1000, 10, 1, 80,true);
          
     },

    forceAreaEffect: function(player, effect){
		 this.isAffected = true;
        //this.game.physics.arcade.accelerationFromRotation(this.areaEffect.rotation,200,this.player.body.acceleration)
		this.game.physics.arcade.accelerationFromRotation(effect.rotation,150,this.player.body.acceleration);
     },

    update: function(){
		var scaler = 0;
		var scaleUp = true;
		this.shipTrail.forEachDead(function(particle){
			particle.tint = 0xffffff;
		});
		this.shipTrail.forEachAlive(function(particle){
			if(particle.tint == 0x000000)return;
			particle.tint = particle.tint - (0x0e0e0e/2);
			if(particle.tint < 0) particle.tint = 0x0;
		});
		
		/*this.fireEngine.forEachDead(function(particle){
			particle.tint = 0xffd200;
		});
		this.fireEngine.forEachAlive(function(particle){
			if(particle.tint == 0x8e8e8e)return;
			if(particle.tint > 0xff0000){
				particle.tint = particle.tint - 0x600;
			}else if(particle.tint <= 0xff0000){
				particle.tint = particle.tint - 0x6f7f8;
			}else if(particle.tint < 0x8e8e8e) particle.tint = 0x8e8e8e;
		});*/
		
        if(!this.isStart) return;

		this.border1.y = this.player.y;
		this.border2.y = this.player.y;
			
        this.shipTrail.emitX = this.player.x;
        this.shipTrail.emitY = this.player.y + 25;
        this.fireEngine.emitX = this.player.x;
        this.fireEngine.emitY = this.player.y + 20;
		this.shieldTrail.emitX = this.player.x;
		this.shieldTrail.emitY = this.player.y;
		
		
		
		
		this.game.physics.arcade.collide([this.playerDeath,this.playerDeath2],[this.circleObstacles,this.squareObstacles,this.border1,this.border2]);
		
		if(this.player.shield){
			this.circle3.x = this.player.x;
			this.circle3.y = this.player.y;
		}

        score = Math.abs(parseInt(this.player.y/288)-2);
        this.scoreText.text = score;
		if(score > parseInt(this.bestScore.text)){
			this.bestScore.text = score;
		}

        this.squareObstacles.forEach(function(square){
            square.angle += square.speed * (this.game.time.elapsed/1000);
            if(square.y > this.player.y + (this.game.height*0.5))
                square.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.4,this.player.y-this.game.height*0.3));
        },this);

        this.circleObstacles.forEach(function(circle){
            circle.angle += circle.speed * (this.game.time.elapsed/1000);
              if(circle.y > this.player.y + (this.game.height*0.5))
                circle.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.4,this.player.y-this.game.height*0.8));
        },this);

        this.items.forEach(function(item){
            item.y += item.speed * (this.game.time.elapsed/1000);
              if(item.y > this.player.y + (this.game.height*0.5))
                item.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.4,this.player.y-this.game.height*0.3));
        },this);

        /*if(this.areaEffect.y  > this.player.y + (this.game.height*0.5)){
            this.areaEffect.x = this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width);
            this.areaEffect.y = this.game.rnd.between(this.player.y-this.game.height*0.8,this.player.y-this.game.height*0.3);
            this.areaEffect.angle = this.game.rnd.between(0,360);
        }*/
		this.areaGroup.forEach(function(effect){
            if(effect.y > this.player.y + (this.game.height*0.5)){
				effect.reset(this.game.rnd.between(this.player.x-this.game.width,this.player.x+this.game.width),this.game.rnd.between(this.player.y-this.game.height*0.4,this.player.y-this.game.height*0.8));
			}
        },this);
		
		
		
        if(!this.player.shield){
          this.game.physics.arcade.overlap(this.player, [this.ground,this.circleObstacles,this.squareObstacles], this.destroyPlayer, null, this);
		}
		
		this.game.physics.arcade.collide(this.player, [this.border1,this.border2], this.destroyPlayer, null, this);
		
        //this.game.physics.arcade.overlap(this.player, this.areaEffect, this.forceAreaEffect, null, this);
		this.game.physics.arcade.overlap(this.player, this.areaGroup, this.forceAreaEffect, null, this);
		if(!this.game.physics.arcade.overlap(this.player, this.areaGroup)){
			this.player.body.acceleration.x = 0;
			this.isAffected = false;
		}
		/*if(!this.game.physics.arcade.overlap(this.player, this.areaEffect)){
			this.player.body.acceleration.x = 0;
		}*/
        this.game.physics.arcade.overlap(this.player, this.items, this.activatePower, null, this);

        if(!this.isPowerUp){
        
          this.player.angle += rotationSpeed * (this.game.time.elapsed/1000);

          if(this.player.angle > config.angleLimit){
              this.player.angle = config.angleLimit;
              rotationSpeed *= -1;
          }
          else if(this.player.angle < -config.angleLimit){
              this.player.angle = -config.angleLimit;
              rotationSpeed *= -1;
          }
        }
		
		this.deceleratePlayer();
    },

    changeBgColor: function(){
        hueValue = this.game.rnd.realInRange(0,1);

        if(hueValue >= 10)
            hueValue = 0;
        var color = Phaser.Color.HSVtoRGB(hueValue,0.5,0.7);
        this.game.stage.backgroundColor =  Phaser.Color.RGBtoString(color.r,color.g,color.b,255,'#');
    }
};