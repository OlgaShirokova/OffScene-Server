import Router from 'koa-router';
import {
  AuthController,
  UserController,
  EventController,
  AppController,
} from '~/controllers';

const router = new Router();

router
  .get('/sign-in', AuthController.signIn)
  .post('/sign-up', AuthController.signUp);
router
  .get('/events', UserController.events) // get events that I'm or I had been involved (logged user)
  .get('/users/:id', UserController.userInfo) // get user info
  .post('/profile-picture', UserController.profilePicture) // upload profile picture
  .post('/users/:id/block', UserController.blockUser)
  .post('/away', UserController.postAway) // create away dates
  .put('/profile', UserController.profile) // update profile info
  .delete('/away', UserController.deleteAway); // delete away dates

router
  .get('/search', EventController.search) // get all dj's that match a certain criteria specified as query params
  .post('/offers', EventController.offers) // send offer for event
  .post('/feedback', EventController.feedback) // give feedback
  .put('/offers/:id', EventController.updateOffer); // change offer status

router.get('/genres', AppController.genres);

export default router.routes();
