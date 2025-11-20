import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advance-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container">
      <div class="circle-logo"></div>
      <div class="text-container">
        <div class="main-text">
          <span class="animate-a">A</span>
          <span class="animate-d">D</span>
          <span class="animate-v">V</span>
          <span class="animate-a2">A</span>
          <span class="animate-n">N</span>
          <span class="animate-c">C</span>
          <span class="animate-e">E</span>
        </div>
        <div class="subtitle animate-subtitle">
          <span>TECHNOLOGY </span>
          <span class="color-transition">PROJECTS</span>
          <span> S.A.S</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      padding: 1rem;
    }

    .circle-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e85d3c 0%, #c94a2a 50%, #b93a85 100%);
      position: relative;
      opacity: 0;
      animation: fadeInRotate 0.5s ease-out forwards, rotateForever 2s linear 0.5s infinite;
      flex-shrink: 0;
    }

    .circle-logo::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 47px;
      height: 47px;
      background: #ffffff;
      border-radius: 50%;
    }

    @keyframes fadeInRotate {
      0% {
        opacity: 0;
        transform: rotate(0deg) scale(0.5);
      }
      100% {
        opacity: 1;
        transform: rotate(360deg) scale(1);
      }
    }

    @keyframes rotateForever {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .text-container {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .main-text {
      font-size: 40px;
      font-weight: bold;
      letter-spacing: 1px;
      line-height: 1;
      display: flex;
    }

    .main-text span {
      opacity: 0;
      color: #434343ff;
      transform: translateX(-20px);
    }

    .subtitle {
      font-size: 11px;
      letter-spacing: 1px;
      font-weight: 600;
      opacity: 0;
    }

    .subtitle span {
      color: #000;
      transition: color 0.3s ease;
    }

    .subtitle .red-text {
      color: #d84a38;
    }

    /* Animaciones específicas */
    .animate-a {
      animation: slideIn 0.3s ease-out 0.6s forwards;
    }

    .animate-d {
      animation: slideIn 0.25s ease-out 0.9s forwards;
    }

    .animate-v {
      animation: slideIn 0.25s ease-out 1.15s forwards;
    }

    .animate-a2 {
      animation: slideIn 0.25s ease-out 1.4s forwards;
    }

    .animate-n {
      animation: slideIn 0.25s ease-out 1.65s forwards;
    }

    .animate-c {
      animation: slideIn 0.25s ease-out 1.9s forwards;
    }

    .animate-e {
      animation: slideIn 0.25s ease-out 2.15s forwards;
    }

    .animate-subtitle {
      animation: fadeInUp 0.4s ease-out 2.4s forwards;
    }

    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateX(-20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Animación de color para PROJECTS */
    .color-transition {
      animation: colorChange 0.4s ease-out 2.6s forwards;
    }

    @keyframes colorChange {
      0% {
        color: #000;
      }
      100% {
        color: #d84a38;
      }
    }
  `]
})
export class AdvanceLoaderComponent {}
