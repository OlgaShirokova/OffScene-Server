import Router from 'koa-router';
import {
  AuthController,
  UserController,
  EventController,
  AppController,
} from '~/controllers';

const usersController = new UserController();

const router = new Router();

router
  .get('/sign-in', AuthController.signIn)
  .post('/sign-up', AuthController.signUp);

router
  .get('/events', AuthController.requireAuth, usersController.events) // get events that I'm or I had been involved (logged user)
  .get('/users/:id', AuthController.requireAuth, usersController.userInfo) // get user info
  .post(
    '/users/:id/block',
    AuthController.requireAuth,
    usersController.blockUser
  )
  .post('/away', AuthController.requireAuth, usersController.postAway) // create away dates
  .put('/profile', AuthController.requireAuth, usersController.updateProfile) // update profile info
  .delete('/away', AuthController.requireAuth, usersController.deleteAway) // delete away dates
  .post('/picture', AuthController.requireAuth, usersController.updatePicture); // update profile picture

router
  .get('/search', AuthController.requireAuth, EventController.search) // get all dj's that match a certain criteria specified as query params
  .post('/offers', AuthController.requireAuth, EventController.offers) // send offer for event
  .post('/feedback', AuthController.requireAuth, EventController.feedback) // give feedback
  .put('/offers/:id', AuthController.requireAuth, EventController.updateOffer); // change offer status

router.get('/genres', AppController.genres);

export default router.routes();
