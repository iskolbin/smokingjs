import SmokingApplication from './SmokingApplication'

document.addEventListener('DOMContentLoaded', () => {
	const app = new SmokingApplication()	
	document.getElementById( 'content' ).appendChild( app.view )
});
