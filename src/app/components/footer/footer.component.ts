import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule, RouterLink, TranslatePipe],
  template: `
    <section class="bg-linear-to-b from-purple-300 to-purple-900"></section>
    <footer
      class="relative bg-linear-to-b from-gray-500 to-black text-white"
    >
      <div class="relative pt-10 pb-8 max-w-6xl mx-auto">
        <hr class="my-8 border-gray-500" />
        <div
          class="grid grid-cols-1 justify-items-center text-lg md:grid-cols-5 gap-8"
        >
          <div class="text-center md:text-left">
            <img
              src="logo.png"
              alt="{{ 'footer.logoAlt' | translate }}"
              class="h-8 mb-4 mx-auto md:mx-0"
            />
            <p class="mb-2 font-bold">{{ 'footer.followUs' | translate }}</p>
            <div class="flex space-x-3 mb-6 justify-center md:justify-start">
              <a
                href="https://www.facebook.com/share/16NW4yFUqo/"
                target="_blank"
                class="hover:text-gray-300"
              >
                <img
                  src="https://img.icons8.com/color/48/facebook.png"
                  alt="facebook"
                />
              </a>
              <a
                href="https://www.instagram.com/p/CbOi0jjOw2a/?igsh=MTd6d2VqOThqczVmbg=="
                target="_blank"
                class="hover:text-gray-300"
              >
                <img
                  src="https://img.icons8.com/color/48/instagram-new--v1.png"
                  alt="instagram-new--v1"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/advance-technology-projects-s.a.s./posts/?feedView=all"
                target="_blank"
                class="hover:text-gray-300"
              >
                <img
                  src="https://img.icons8.com/color/48/linkedin.png"
                  alt="linkedin"
                />
              </a>
            </div>
          </div>

          <div class="text-center md:text-left">
            <h4 class="font-bold mb-4">
              {{ 'footer.solutions.title' | translate }}
            </h4>
            <ul class="space-y-2 text-sm text-purple-100">
              <li>
                <a
                  routerLink="/hardware-provisioning"
                  class="hover:underline"
                  >{{ 'footer.solutions.hardwareProvisioning' | translate }}</a
                >
              </li>
              <li>
                <a
                  routerLink="/enterprise-technologies"
                  class="hover:underline"
                  >{{ 'footer.solutions.enterpriseIT' | translate }}</a
                >
              </li>
              <li>
                <a
                  routerLink="/software-as-a-service"
                  class="hover:underline"
                  >{{ 'footer.solutions.softwareSaaS' | translate }}</a
                >
              </li>
              <li>
                <a routerLink="/helpdesk-support" class="hover:underline">{{
                  'footer.solutions.helpDesk' | translate
                }}</a>
              </li>
              <li>
                <a routerLink="/cloud-cibersecurity" class="hover:underline">
                  {{ 'footer.solutions.cloudCybersecurity' | translate }}</a
                >
              </li>
            </ul>
          </div>

          <div class="text-center md:text-left ">
            <h4 class="font-bold mb-4">
              {{ 'footer.aboutUs.title' | translate }}
            </h4>
            <ul class="space-y-2 text-sm text-purple-200">
              <li>
                <a
                  routerLink="/nuestra-historia"
                  class="hover:underline"
                  >{{ 'footer.aboutUs.ourHistory' | translate }}</a
                >
              </li>

              <li>
                <a
                  routerLink="/impacto-social"
                  class="hover:underline"
                  >{{ 'footer.aboutUs.socialImpact' | translate }}</a
                >
              </li>
            </ul>
          </div>

          <div class="text-center md:text-left">
            <h4 class="font-bold mb-4">
              {{ 'footer.resources.title' | translate }}
            </h4>
            <ul class="space-y-2 text-sm mb-4 text-gray-200">
              <li class="hover:font-bold hover:text-white">
                <a routerLink="/white-papers" class="hover:underline">{{
                  'footer.resources.whitePapers' | translate
                }}</a>
              </li>
              <li class="hover:font-bold hover:text-white">
                <a routerLink="/case-studies" class="hover:underline">{{
                  'footer.resources.advanceAcademy' | translate
                }}</a>
              </li>
              <li class="hover:font-bold hover:text-white">
                <a routerLink="/partners" class="hover:underline">{{
                  'footer.resources.partners' | translate
                }}</a>
              </li>
              <li class="hover:font-bold hover:text-white">
                <a routerLink="/faq" class="hover:underline">{{
                  'footer.resources.faq' | translate
                }}</a>
              </li>
            </ul>
          </div>

          <div class="text-center md:text-left">
            <p class="text-sm mb-1">
              {{ 'footer.contact.salesEmail' | translate }}
            </p>
            <p class="text-sm mb-1">
              {{ 'footer.contact.supportEmail' | translate }}
            </p>

            <p class="text-sm">
              {{ 'footer.contact.addressLine1' | translate }} <br />
              {{ 'footer.contact.addressLine2' | translate }}<br />
            </p>

            <a
              href="https://api.whatsapp.com/send/?phone=%2B573112314768&text&type=phone_number&app_absent=0"
              target="_blank"
              class="hover:text-gray-300 mt-2 gap-4 text-sm text-center flex justify-center md:justify-start"
            >
              {{ 'footer.contact.letstalk' | translate }}
              <img
                src="https://img.icons8.com/color/28/whatsapp.png"
                alt="whatsapp"
              />
            </a>
            <p class="text-sm mb-1">
              <img src="" alt="" />
            </p>
          </div>
        </div>

        <!-- ubicaciones y terminos  -->

        <hr class="my-8 border-gray-500" />
        <div
          class="flex flex-col md:flex-row items-center justify-between text-sm text-gray-300"
        >
          <div
            class="flex flex-wrap items-center space-x-3 mb-4 md:mb-0 justify-center md:justify-start"
          >
            <span class="font-bold uppercase text-white mr-2">{{
              'footer.locations.title' | translate
            }}</span>
            <a routerLink="/locations" class="hover:underline">{{
              'footer.locations.usa' | translate
            }}</a>
            <a
              routerLink="/locations"
              class="hover:underline"
              >{{ 'footer.locations.colombia' | translate }}</a
            >
            <a
              routerLink="/locations"
              class="hover:underline"
              >{{ 'footer.locations.mexico' | translate }}</a
            >
            <a
              routerLink="/locations"
              class="hover:underline"
              >Perú</a
            >
            <a
              routerLink="/locations"
              class="hover:underline"
              >Brasil</a>
            <a
              routerLink="/locations"
              class="hover:underline"
              >Ecuador</a>
            
          </div>

          <div class="text-center md:text-right text-xs text-gray-400">
            {{ 'footer.copyright' | translate }}
            <br class="md:hidden" />|
            <a
              routerLink="/terms-and-conditions"
              class="hover:underline mx-2 cursor-pointer"
              >{{ 'footer.termsAndPrivacy' | translate }}</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
