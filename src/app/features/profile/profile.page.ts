import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Meu perfil</h1>

    @if (!auth.user()) {
    <p>Carregando perfil...</p>
    } @else {
    <form (ngSubmit)="save()" #form="ngForm">
      <label>
        Nome
        <input type="text" [(ngModel)]="name" name="name" required minlength="3" />
      </label>

      <label>
        Email
        <input type="email" [(ngModel)]="email" name="email" required email />
      </label>

      @if (success) {
      <p style="color: green">Perfil atualizado com sucesso!</p>
      }

      <button type="submit" [disabled]="!form.valid">Salvar alterações</button>
    </form>
    }
    <button>
      <a routerLink="/profile/password">Alterar senha</a>
    </button>
  `,
})
export class ProfilePage implements OnInit {
  auth = inject(AuthService);

  name = '';
  email = '';
  success = false;

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.name = user.name;
      this.email = user.email;
    }
  }

  save() {
    this.success = false;

    this.auth.updateMe({
      name: this.name,
      email: this.email,
    });

    this.success = true;
  }
}
