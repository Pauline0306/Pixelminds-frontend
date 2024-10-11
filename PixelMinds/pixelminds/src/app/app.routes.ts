import { RouterModule, Routes,} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { importProvidersFrom, NgModule } from '@angular/core';
import { CreatepostComponent } from './createpost/createpost.component';
import { HomePageComponent } from './homepage/homepage.component';
import { MyBlogComponent } from './myblog/myblog.component';
import { AuthGuard } from './auth.guard';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'homepage', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'createpost', component: CreatepostComponent, canActivate: [AuthGuard] },
  { path: 'myblog', component: MyBlogComponent }, // Comma added here
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), FormsModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
