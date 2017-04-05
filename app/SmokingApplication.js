import {Application, Sprite, loader} from 'pixi.js'

export default class SmokingApplication extends Application {
	constructor() {
		super( 640, 480 )
		this.createPad()
		this.createBall()
		loader.add( 'lungs', 'lungs.json' ).load((loader,{lungs}) => {
			this.createBlocks( lungs )
		})
	}

	createObject( image, x, y ) {
		const object = Sprite.fromImage( image )
		object.x = x
		object.y = y
		this.stage.addChild( object )
		return object
	}

	createPad() {
		this.pad = this.createObject( 'cigarette.png', 350, 460 )
	}

	createBall() {
		this.ball = this.createObject( 'white_square.png', 365, 440 )
	}

	createBlocks( lungs ) {
		console.log( lungs )
		this.blocks = []

	}
}
