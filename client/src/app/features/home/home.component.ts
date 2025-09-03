// ******no animation****************

// import { Component, AfterViewInit } from '@angular/core';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-home',
//   imports: [ 
//     RouterLink
//   ],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.scss'
// })
// export class HomeComponent implements AfterViewInit {

//   ngAfterViewInit() {
//     // Ensure video autoplays
//     const video = document.querySelector('.hero-video') as HTMLVideoElement;
//     if (video) {
//       video.muted = true;
//       video.play().catch(error => {
//         console.log('Video autoplay failed:', error);
//       });
//     }
//   }

//   scrollToTypes() {
//     const element = document.getElementById('shop-by-sport');
//     if (element) {
//       element.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   }

// }


// ******whole section animation****************

// import { Component, AfterViewInit } from '@angular/core';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-home',
//   imports: [RouterLink],
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.scss']
// })
// export class HomeComponent implements AfterViewInit {

//   ngAfterViewInit() {
//     // Ensure video autoplays
//     const video = document.querySelector('.hero-video') as HTMLVideoElement;
//     if (video) {
//       video.muted = true;
//       video.play().catch(error => {
//         console.log('Video autoplay failed:', error);
//       });
//     }

//     // Scroll animation for shop-by-sport
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add('show');
//           observer.unobserve(entry.target); // optional: unobserve after first show
//         }
//       });
//     }, { threshold: 0.1 });

//     const scrollElements = document.querySelectorAll('.animate-scroll');
//     scrollElements.forEach(el => observer.observe(el));
//   }

//   scrollToTypes() {
//     const element = document.getElementById('shop-by-sport');
//     if (element) {
//       element.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   }

// }


// ******card by card animation****************

import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    // Ensure video autoplays
    const video = document.querySelector('.hero-video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }

    // Scroll animation for shop-by-sport with stagger
    const scrollElements = document.querySelectorAll('.animate-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add class 'show' with stagger based on index
          scrollElements.forEach((el, i) => {
            setTimeout(() => {
              el.classList.add('show');
            }, i * 150); // كل كارد يظهر بعد 150ms من اللي قبله
          });
          observer.disconnect(); // stop observing after first trigger
        }
      });
    }, { threshold: 0.1 });

    scrollElements.forEach(el => observer.observe(el));
  }

  scrollToTypes() {
    const element = document.getElementById('shop-by-sport');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

}
