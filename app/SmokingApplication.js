import {Application, Sprite, loader, ticker, extras} from 'pixi.js'
import {Howl} from 'howler'

const WIDTH = 640
const HEIGHT = 480

export default class SmokingApplication extends Application {
	constructor() {
		super( WIDTH, HEIGHT )
		this.width = WIDTH
		this.height = HEIGHT
		this.columns = 81
		this.rows = 10
		this.blockSize = 8
		this.tracking = true
		loader.add( 'lungs', 'lungs.json' )
			.add( 'sounds', 'sounds.json' )
			.add( 'tilesheet', 'tilesheet.json' )
			.load((loader,{lungs,sounds}) => {
				this.initBlocks( lungs.data )
				this.initPad()
				this.initBall()
				this.initHowler( sounds )
				ticker.shared.add( () => this.update( ticker.shared.elapsedMS ))
			})
	}

	initHowler( sounds ) {
		sounds.data.src = sounds.data.urls
		this.sound = new Howl( sounds.data )	
	}

	onKeyup({keyCode}) {
		switch (keyCode) {
			case 39:
				this.pad.movingRight = false
				break
			case 37:
				this.pad.movingLeft = false
				break
		}
	}

	onKeydown({keyCode}) {
		switch (keyCode) {
			case 39:
				this.pad.movingRight = true
				break
			case 37:
				this.pad.movingLeft = true
				break
		}
	}

	createObject( images, x, y ) {
		const object = extras.AnimatedSprite.fromImages( images )
		object.x = x
		object.y = y
		this.stage.addChild( object )
		return object
	}

	initPad() {
		this.pad = {
			x: 350,
			y: 460,
			vx: 0,
			vy: 0,
			velocity: 100,
			movingRight: false,
			movingLeft: false,
			sprite: this.createObject( ['cigarette.png'], 350, 460 )
		}
	}

	initBall() {
		this.ball = {
			x: 365,
			y: 440,
			vx: 100,
			vy: 100,
			sprite: this.createObject( ['white_square.png'], 365, 440 )
		}
	}

	createBlock( i ) {
		const {columns,blockSize} = this
		const x = (i % columns) * blockSize
		const y = ((i / columns)|0) * blockSize
		return {
			x: x,
			y: y,
			hp: 2,
			sprite: this.createObject( ['','_damaged1','_damaged2','_damaged3'].map( v => `white_square${v}.png` ), x ,y )
		}
	}

	initBlocks( data ) {
		this.blocks = data.blocks.map( (v,i) => v === 1 ? this.createBlock( i ) : null ).filter( v => v !== null )
	}

	run() {
		this.active = true
	}

	updateBall( dt ) {
		const {ball,width,height} = this
		const balldx = ball.vx * dt * 0.001
		const balldy = ball.vy * dt * 0.001
		if (( ball.x + balldx <= 0 && ball.vx < 0 ) || ( ball.x + ball.sprite.width + balldx >= this.width )) {
			this.sound.play( 'hit' )
			ball.vx = -ball.vx
			ball.x -= balldx
		} else {
			ball.x += balldx
		}
		if (( ball.y + balldy <= 0 && ball.vy < 0 ) || ( ball.y + ball.sprite.height + balldy >= this.height )) {
			this.sound.play( 'hit' )
			ball.vy = -ball.vy
			ball.y -= balldy
		} else {
			ball.y += balldy
		}
		
		ball.sprite.x = ball.x | 0
		ball.sprite.y = ball.y | 0
	}

	track() {
		const {pad,ball} = this
		if ( pad.x + pad.sprite.width/2 > ball.x+ball.sprite.width/2 ) {
			pad.movingLeft = true
			pad.movingRight = false
		} else {
			pad.movingLeft = false
			pad.movingRight = true
		}
	}

	updatePad( dt ) {
		const {pad,width,height} = this
		
		if ( this.tracking ) {
			this.track()
		}
		
		if ( pad.movingLeft && !pad.movingRight ) {
			pad.vx = -pad.velocity
		} else if ( pad.movingRight && !pad.movingLeft ) {
			pad.vx = pad.velocity
		} else {
			pad.vx = 0
		}
		
		const paddx = pad.vx * dt * 0.001
		const paddy = pad.vy * dt * 0.001
		if ( pad.x + paddx >= 0 && pad.x + pad.sprite.width + paddx <= this.width ) {
			pad.x += paddx
		}
		if ( pad.y + paddy >= 0 && pad.y + pad.sprite.width + paddy <= this.width ) {
			pad.y += paddy
		}

		pad.sprite.x = pad.x | 0
		pad.sprite.y = pad.y | 0
	}

	checkCollision( x0,y0,w0,h0, x1,y1,w1,h1 ) {
		return x0 <= x1+w1 && x1 <= x0+w0 && y0 <= y1+h1 && y1 <= y0+h0
	}

	getCollisionSide( o1, o2 ) {
		const {x:x0,y:y0,sprite:{width:w0,height:h0}} = o1
		const {x:x1,y:y1,sprite:{width:w1,height:h1}} = o2

		if ( x0 <= x1+w1 && x1 <= x0+w0 && y0 <= y1+h1 && y1 <= y0+h0 ) {
			const lrtb = [
				Math.abs( x0 - x1 - w1 ),
				Math.abs( x1 - x0 - w0 ),
				Math.abs( y0 - y1 - h1 ),
				Math.abs( y1 - y0 - h0 )]
			let max = 0
			if ( lrtb[1] > lrtb[max] ) max = 1
			if ( lrtb[2] > lrtb[max] ) max = 2
			if ( lrtb[3] > lrtb[max] ) max = 3
			switch ( max ) {
				case 0: return 'LEFT'
				case 1: return 'RIGHT'
				case 2: return 'BOTTOM'
				case 3: return 'TOP'
			}
		} else {
			return 'NONE'
		}
	}

	damageBlock( block ) {
		block.hp -= 1
		block.sprite.gotoAndStop( this.blocks.length%3 + 1 )
	}

	flushBlocks() {
		const toremove = this.blocks.filter( block => block.hp <= 0 )
		if ( toremove.length > 0 ) {
			this.blocks = this.blocks.filter( block => block.hp > 0 )
			toremove.forEach( block => block.sprite.destroy())
			this.sound.play( 'blow' )
		}
	}

	updateCollisions() {
		const {pad,ball} = this
		switch ( this.getCollisionSide( pad, ball )) {
			case 'LEFT': case 'RIGHT':
				ball.vx = -ball.vx
				this.sound.play( 'hit' )
				break

			case 'BOTTOM': case 'TOP':
				ball.vy = -ball.vy
				this.sound.play( 'hit' )
				break

			default: 
		}

		for ( let b of this.blocks ) {		
			switch ( this.getCollisionSide( b, ball )) {
				case 'LEFT': case 'RIGHT':
					this.damageBlock( b )
					ball.vx = -ball.vx
					this.sound.play( 'hit' )
					break

				case 'BOTTOM': case 'TOP':
					this.damageBlock( b )
					ball.vy = -ball.vy
					this.sound.play( 'hit' )
					break

				default: 
			}
		}

		this.flushBlocks()
	}

	update( dt ) {
		this.updateBall( dt )
		this.updatePad( dt )
		this.updateCollisions()
	}
}
