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
  .get('/events', AuthController.requireAuth, UserController.events) // get events that I'm or I had been involved (logged user)
  .get('/users/:id', AuthController.requireAuth, UserController.userInfo) // get user info
  .post(
    '/users/:id/block',
    AuthController.requireAuth,
    UserController.blockUser
  )
  .post('/away', AuthController.requireAuth, UserController.postAway) // create away dates
  .put('/profile', AuthController.requireAuth, UserController.profile) // update profile info
  .delete('/away', AuthController.requireAuth, UserController.deleteAway); // delete away dates

router
  .get('/search', EventController.search) // get all dj's that match a certain criteria specified as query params
  .post('/offers', EventController.offers) // send offer for event
  .post('/feedback', EventController.feedback) // give feedback
  .put('/offers/:id', EventController.updateOffer); // change offer status

router.get('/genres', AppController.genres);

export default router.routes();
