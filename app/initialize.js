import SmokingApplication from './SmokingApplication'

document.addEventListener('DOMContentLoaded', () => {
	const app = new SmokingApplication()	
	document.getElementById( 'content' ).appendChild( app.view )
	window.addEventListener( 'keydown', (e) => app.onKeydown(e) )
	window.addEventListener( 'keyup', (e) => app.onKeyup(e) )
});
