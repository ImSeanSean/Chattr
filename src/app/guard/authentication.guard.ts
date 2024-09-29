import { CanActivateFn, Router } from '@angular/router';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username');
  const userid = localStorage.getItem('userid');

  if (email && username && userid) {
    return true;
  } else {
    const router = new Router();
    router.navigate(['/']);
    return false;
  }
};
