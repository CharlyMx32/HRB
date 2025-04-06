import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./auth/login/login.component";
import { MensajesComponent } from "./components/mensajes/mensajes.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MensajesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'HRB';
}
