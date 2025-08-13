import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShopComponent } from './shop.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ShopComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('clint');
}
