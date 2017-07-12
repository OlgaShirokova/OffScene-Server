import Router from 'koa-router';
import {
  AuthController,
  UserController,
  PerformanceController,
  AppController,
} from '~/controllers';

const usersController = new UserController();
const performancesController = new PerformanceController();

const router = new Router();

router
  .get('/sign-in', AuthController.signIn)
  .post('/sign-up', AuthController.signUp);

router
  .get(
    '/performances',
    AuthController.requireAuth,
    usersController.performances
  ) // get performances that I'm or I had been involved (logged user)
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
  .get('/search', performancesController.search) // get all actors that match a certain criteria specified as query params
  .post('/offers', AuthController.requireAuth, performancesController.offers) // send offer for performance
  .post(
    '/feedback',
    AuthController.requireAuth,
    performancesController.feedback
  ) // give feedback
  .put(
    '/offers/:id',
    AuthController.requireAuth,
    performancesController.updateOffer
  ); // change offer status

router.get('/genres', AppController.genres);

export default router.routes();
