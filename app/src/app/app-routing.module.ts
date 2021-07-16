import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'animator', loadChildren: () => import('./pages/animator/animator.module').then(m => m.AnimatorPageModule)},
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)},
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
