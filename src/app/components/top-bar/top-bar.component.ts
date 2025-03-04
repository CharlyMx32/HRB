import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  email: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const userData = this.authService.getUser();
    console.log('User data:', userData);
    if (userData && userData.user && userData.user.email) {
      this.email = userData.user.email;
    } else {
      this.email = 'NADa';
    }
  }

}