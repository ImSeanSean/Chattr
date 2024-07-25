import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../interfaces/user';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-the-chatter',
  standalone: true,
  imports: [NgFor],
  templateUrl: './the-chatter.component.html',
  styleUrl: './the-chatter.component.css'
})
export class TheChatterComponent implements OnInit{
  //Variables
  users: User[] = [];

  constructor(
    private userService: UsersService
  ){}

  getUsers() {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.users = result;
    });
  }

  ngOnInit(): void {
      this.getUsers();
  }
}
